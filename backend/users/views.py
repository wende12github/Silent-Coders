from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema


from users.models import User
from users.serializers import (
    CurrentUserProfileSerializer,
    UserProfileUpdateSerializer,
    PublicUserSerializer,
)

User = get_user_model()


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserProfileUpdateSerializer

        return CurrentUserProfileSerializer

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(
        operation_description="Retrieve the authenticated user's profile.",
        responses={200: CurrentUserProfileSerializer()},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update the authenticated user's profile (PATCH - partial update).",
        request_body=UserProfileUpdateSerializer,
        responses={200: CurrentUserProfileSerializer(), 400: "Validation error"},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update the authenticated user's profile (PUT - full update).",
        request_body=UserProfileUpdateSerializer,
        responses={200: CurrentUserProfileSerializer(), 400: "Validation error"},
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)


class PublicUserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = PublicUserSerializer

    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Retrieve a public user profile by ID.",
        responses={200: PublicUserSerializer(), 404: "User not found"},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
