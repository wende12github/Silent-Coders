from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Q
from notifications.services import notify_user
from .models import LOCATION_CHOICES, Skill
from users.serializers import SkillSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Exists, OuterRef
from notifications.services import notify_user
from bookings.models import AvailabilitySlot


User = get_user_model()


class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.filter(is_visible=True)
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_description="List skills (visible by default, with search/filter) offered by users with at least one free availability slot, excluding the authenticated user's skills, or create a new skill (authenticated users only).",
        manual_parameters=[
            openapi.Parameter(
                "search",
                openapi.IN_QUERY,
                description="Search skills by name or description.",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "tags",
                openapi.IN_QUERY,
                description="Filter skills by tags (comma-separated).",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "user_id",
                openapi.IN_QUERY,
                description="Filter skills by the user who offers them.",
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                "is_offered",
                openapi.IN_QUERY,
                description="Filter skills by whether they are offered (true/false).",
                type=openapi.TYPE_BOOLEAN,
            ),
            openapi.Parameter(
                'location',
                openapi.IN_QUERY,
                description="Filter skills by location ('local' or 'remote').",
                type=openapi.TYPE_STRING,
                enum=[choice[0] for choice in LOCATION_CHOICES] # Use choices from model
            ),
        ],
        responses={
            200: SkillSerializer(many=True),
            201: SkillSerializer(),
            400: "Validation error",
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new skill for the authenticated user.",
        request_body=SkillSerializer,
        responses={
            201: SkillSerializer(),
            400: "Validation error",
            401: "Authentication credentials not provided",
        },
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()

        # Exclude the authenticated user's skills
        if self.request.user.is_authenticated:
            queryset = queryset.exclude(user=self.request.user)

        search_query = self.request.query_params.get("search")
        tags_query = self.request.query_params.get("tags")
        user_id_query = self.request.query_params.get("user_id")
        is_offered_query = self.request.query_params.get("is_offered")
        location_query = self.request.query_params.get('location')

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )

        if tags_query:
            tags_list = [
                tag.strip().lower() for tag in tags_query.split(",") if tag.strip()
            ]
            if tags_list:
                queryset = queryset.filter(tags__name__in=tags_list).distinct()

        if user_id_query:
            try:
                user_id = int(user_id_query)
                queryset = queryset.filter(user_id=user_id)
            except ValueError:
                pass

        if is_offered_query is not None:
            is_offered = is_offered_query.lower() == "true"
            queryset = queryset.filter(is_offered=is_offered)

        valid_locations = [choice[0] for choice in LOCATION_CHOICES]
        if location_query and location_query in valid_locations:
            queryset = queryset.filter(location=location_query)

        queryset = queryset.annotate(
            has_free_slot=Exists(
                AvailabilitySlot.objects.filter(
                    booked_for=OuterRef("user"), is_booked=False
                )
            )
        )

        queryset = queryset.filter(has_free_slot=True)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            raise PermissionDenied("Authentication required to create a skill.")


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_description="Retrieve details of a specific skill (must be visible).",
        responses={200: SkillSerializer(), 404: "Skill not found or not visible"},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update details of a specific skill (PATCH - partial update). Only the owner can update.",
        request_body=SkillSerializer,
        responses={
            200: SkillSerializer(),
            400: "Validation error",
            403: "Permission denied",
            404: "Skill not found or not visible",
        },
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update details of a specific skill (PUT - full update). Only the owner can update.",
        request_body=SkillSerializer,
        responses={
            200: SkillSerializer(),
            400: "Validation error",
            403: "Permission denied",
            404: "Skill not found or not visible",
        },
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a specific skill. Only the owner can delete.",
        responses={
            204: "No Content",
            403: "Permission denied",
            404: "Skill not found or not visible",
        },
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def get_object(self):
        skill = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            if skill.user != self.request.user:
                raise PermissionDenied(
                    "You do not have permission to modify this skill."
                )
        return skill


class EndorseSkillView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Endorse a specific skill. Each user can endorse a skill only once.",
        request_body=None,
        responses={
            200: SkillSerializer(),
            400: "Already endorsed or Invalid request",
            404: "Skill not found or not visible",
        },
    )
    def post(self, request, pk):
        with transaction.atomic():
            skill = get_object_or_404(
                Skill.objects.filter(is_visible=True).select_for_update(), pk=pk
            )

            if skill.user == request.user:
                return Response(
                    {"detail": "You cannot endorse your own skill."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            session_key = f"endorsed_skill:{request.user.id}:{skill.id}"

            if request.session.get(session_key):
                return Response(
                    {"detail": "You have already endorsed this skill."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            skill.endorsements += 1
            skill.save()

            request.session[session_key] = True

            notify_user(
                skill.user,
                "endorsement",
                f"Your skill '{skill.name}' was endorsed by {request.user.username}!",
            )

            return Response(SkillSerializer(skill).data, status=status.HTTP_200_OK)


class MySkillsListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List skills offered by the authenticated user.",
        responses={200: SkillSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)
