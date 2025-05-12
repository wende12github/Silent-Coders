from groups.models import Group, GroupMembership, UserStats
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import ExpressionWrapper, F, FloatField
from django.contrib.auth import get_user_model
from .serializers import (
    EmptySerializer,
    GroupListSerializer,
    GroupSerializer,
    GroupUpdateSerializer,
    GroupDetailSerializer,
    GroupLeaderboardSerializer,
    GroupAnnouncementSerializer,
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()


class GroupListAPIView(generics.ListAPIView):
    queryset = Group.objects.filter(is_active=True).order_by("name")
    serializer_class = GroupListSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List all active groups.",
        responses={200: GroupListSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        member_group_ids = GroupMembership.objects.filter(
            user=user, is_active=True
        ).values_list("group_id", flat=True)
        queryset = (
            Group.objects.filter(is_active=True)
            .exclude(id__in=member_group_ids)
            .order_by("name")
        )

        return queryset


class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new group.",
        request_body=GroupSerializer,
        responses={201: GroupDetailSerializer, 400: "Validation error"},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()


class MyGroupsListView(generics.ListAPIView):
    serializer_class = GroupListSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List all groups the authenticated user is a member of.",
        responses={200: GroupListSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Group.objects.filter(
            groupmembership__user=self.request.user,
            groupmembership__is_active=True,
            is_active=True,
        ).order_by("name")


class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.filter(is_active=True)
    serializer_class = GroupDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve details of a specific group. User must be an active member.",
        responses={200: GroupDetailSerializer(), 403: "Forbidden", 404: "Not Found"},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_object(self):
        group = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

        if not group.groupmembership_set.filter(
            user=self.request.user, is_active=True
        ).exists():
            raise PermissionDenied("You are not an active member of this group.")
        return group


class GroupUpdateView(generics.UpdateAPIView):
    queryset = Group.objects.filter(is_active=True)
    serializer_class = GroupUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch", "put"]

    @swagger_auto_schema(
        operation_description="Update details of a specific group. Only the group owner can update.",
        request_body=GroupUpdateSerializer,
        responses={
            200: GroupDetailSerializer(),
            400: "Validation error",
            403: "Forbidden",
            404: "Not Found",
        },
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update details of a specific group. Only the group owner can update.",
        request_body=GroupUpdateSerializer,
        responses={
            200: GroupDetailSerializer(),
            400: "Validation error",
            403: "Forbidden",
            404: "Not Found",
        },
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def get_object(self):
        group = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

        if group.owner != self.request.user:
            raise PermissionDenied("You do not have permission to update this group.")
        return group

    def perform_update(self, serializer):
        serializer.save()


class GroupJoinView(generics.GenericAPIView):
    queryset = Group.objects.filter(is_active=True)
    serializer_class = EmptySerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Join an active group by its ID. User will be added as an active member.",
        request_body=None,
        responses={
            201: openapi.Response("Successfully joined", schema=GroupDetailSerializer),
            200: openapi.Response("Already a member", schema=GroupDetailSerializer),
            404: "Group not found or not active",
            403: "Forbidden",
        },
    )
    def post(self, request, pk):
        group = get_object_or_404(self.get_queryset(), pk=pk)

        membership, created = GroupMembership.objects.get_or_create(
            user=request.user,
            group=group,
            defaults={"is_active": True},
        )

        if not created and membership.is_active:
            serializer = GroupDetailSerializer(group, context={"request": request})
            return Response(
                {
                    "message": "You are already an active member of this group.",
                    "group": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        elif not created and not membership.is_active:
            membership.is_active = True
            membership.save()
            serializer = GroupDetailSerializer(group, context={"request": request})
            return Response(
                {
                    "message": f"Your membership to group {group.name} has been reactivated.",
                    "group": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            serializer = GroupDetailSerializer(group, context={"request": request})
            return Response(
                {
                    "message": f"You have successfully joined the group {group.name}.",
                    "group": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )


class GroupLeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GroupLeaderboardSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the leaderboard for a specific group. User must be a member of the group.",
        manual_parameters=[
            openapi.Parameter(
                "sort_by",
                openapi.IN_QUERY,
                description="Field to sort by: 'given', 'received', 'sessions', or 'net'. Defaults to 'given'.",
                type=openapi.TYPE_STRING,
                enum=["given", "received", "sessions", "net"],
            ),
            openapi.Parameter(
                "top",
                openapi.IN_QUERY,
                description="Number of top members to return. Defaults to 10.",
                type=openapi.TYPE_INTEGER,
            ),
        ],
        responses={
            200: GroupLeaderboardSerializer(many=True),
            403: "Forbidden",
            404: "Group not found",
        },
    )
    def list(self, request, *args, **kwargs):
        group_id = self.kwargs.get("group_id")
        group = get_object_or_404(Group.objects.filter(is_active=True), pk=group_id)

        if not group.groupmembership_set.filter(
            user=self.request.user, is_active=True
        ).exists():
            raise PermissionDenied("You are not an active member of this group.")

        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        group_id = self.kwargs.get("group_id")
        sort_by = self.request.query_params.get("sort_by", "given")
        top_n = int(self.request.query_params.get("top", 10))

        group = get_object_or_404(Group.objects.filter(is_active=True), pk=group_id)

        queryset = UserStats.objects.filter(
            group=group,
            user__groupmembership__group=group,
            user__groupmembership__is_active=True,
        )

        order_map = {
            "given": "-total_hours_given",
            "received": "-total_hours_received",
            "sessions": "-sessions_completed",
            "net": "",
        }

        if sort_by == "net":
            queryset = queryset.annotate(
                net=ExpressionWrapper(
                    F("total_hours_given") - F("total_hours_received"),
                    output_field=FloatField(),
                )
            ).order_by("-net")[:top_n]
        else:
            queryset = queryset.order_by(order_map.get(sort_by, "-total_hours_given"))[
                :top_n
            ]

        return queryset


class GroupAnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get group announcements",
        operation_description="Returns a list of announcements for the group. User must be an active group member.",
        responses={200: GroupAnnouncementSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create a group announcement",
        operation_description="Only the group owner can post an announcement to an active group.",
        request_body=GroupAnnouncementSerializer,
        responses={
            201: GroupAnnouncementSerializer,
            400: "Validation error",
            403: "Forbidden",
            404: "Group not found",
        },
    )
    def post(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        group_id = self.kwargs["group_id"]

        group = get_object_or_404(Group.objects.filter(is_active=True), pk=group_id)

        if not group.groupmembership_set.filter(
            user=self.request.user, is_active=True
        ).exists():
            raise PermissionDenied("You are not an active member of this group.")

        return group.announcements.all().order_by("-created_at")

    def perform_create(self, serializer):
        group_id = self.kwargs["group_id"]

        group = get_object_or_404(Group.objects.filter(is_active=True), pk=group_id)

        if group.owner != self.request.user:
            raise PermissionDenied("Only the group owner can post announcements.")

        serializer.save(group=group, posted_by=self.request.user)
