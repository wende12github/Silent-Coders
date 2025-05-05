from groups.models import Group, GroupMembership, UserStats
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import ExpressionWrapper, F, FloatField
from django.contrib.auth import get_user_model
from .serializers import EmptySerializer, GroupListSerializer, GroupSerializer, GroupDetailSerializer, GroupLeaderboardSerializer
from .serializers import EmptySerializer, GroupSerializer, GroupDetailSerializer, GroupAnnouncementSerializer
from .models import GroupAnnouncement
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()


class GroupListAPIView(generics.ListAPIView):
    queryset = Group.objects.filter(is_active=True)
    serializer_class = GroupListSerializer
    permission_classes = [permissions.IsAuthenticated]

class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyGroupsListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.custom_groups.all()  # Use related_name from Group.members


class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        group = super().get_object()
        if not group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied("You are not a member of this group.")
        return group

class GroupJoinView(generics.GenericAPIView):
    queryset = Group.objects.all()
    serializer_class = EmptySerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
    operation_description="Join a group by its ID.",
    request_body=None,
    responses={201: openapi.Response("Successfully joined"), 200: "Already a member"}
)
    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        # Ensure the user is not already a member of the group
        if group.members.filter(pk=request.user.pk).exists():
            return Response({"message": "You are already a member of this group."}, status=status.HTTP_200_OK)

        # Add the user as a member with 'accepted' status
        GroupMembership.objects.create(user=request.user, group=group)

        return Response({"message": f"You have successfully joined the group {group.name}."}, status=status.HTTP_201_CREATED)


class GroupLeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GroupLeaderboardSerializer

    def get_queryset(self):
        group_id = self.kwargs.get('group_id')  # Fetch group by ID from URL
        sort_by = self.request.query_params.get('sort_by', 'given')  # default: given
        top_n = int(self.request.query_params.get('top', 10))

        order_map = {
            'given': '-total_hours_given',
            'received': '-total_hours_received',
            'sessions': '-sessions_completed',
            'net': '',  # Sorting by annotation if needed
        }

        queryset = UserStats.objects.filter(group_id=group_id)  # Filter by group

        if sort_by == 'net':
            queryset = queryset.annotate(
                net=ExpressionWrapper(F('total_hours_given') - F('total_hours_received'), output_field=FloatField())
            ).order_by('-net')[:top_n]
        else:
            queryset = queryset.order_by(order_map.get(sort_by, '-total_hours_given'))[:top_n]

        return queryset


class GroupAnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get group announcements",
        operation_description="Returns a list of announcements for the group. Must be a group member.",
        responses={200: GroupAnnouncementSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create a group announcement",
        operation_description="Only the group owner can post an announcement to the group.",
        request_body=GroupAnnouncementSerializer,
        responses={201: GroupAnnouncementSerializer}
    )

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, pk=group_id)

        if not group.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this group.")
        return group.announcements.all().order_by('-created_at')

    def perform_create(self, serializer):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, pk=group_id)

        if group.owner != self.request.user:
            raise PermissionDenied("Only the group owner can post announcements.")

        serializer.save(group=group, posted_by=self.request.user)