from tokenize import TokenError
from rest_framework import status, generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model

from .models import EmailNotificationPreference

from users.models import User

from .serializers import (
    UserSerializer,
    PasswordChangeSerializer,
    EmailPreferenceSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={201: UserSerializer(), 400: "Validation error"},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Logout the authenticated user by blacklisting the refresh token.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "refresh_token": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Refresh token"
                ),
            },
            required=["refresh_token"],
        ),
        responses={205: "Logged out successfully", 400: "Invalid request or token"},
    )
    def post(self, request):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response(
                {"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully"},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except TokenError as e:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": "An error occurred during logout."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Change the authenticated user's password.",
        request_body=PasswordChangeSerializer,
        responses={
            200: "Password updated successfully",
            400: "Invalid input or wrong old password",
        },
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"detail": "Wrong old password."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response(
                {"detail": "Password updated successfully."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateEmailPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = EmailPreferenceSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve or update the authenticated user's email notification preferences.",
        responses={200: EmailPreferenceSerializer()},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update the authenticated user's email notification preferences (PATCH - partial update).",
        request_body=EmailPreferenceSerializer,
        responses={200: EmailPreferenceSerializer(), 400: "Validation error"},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update the authenticated user's email notification preferences (PUT - full update).",
        request_body=EmailPreferenceSerializer,
        responses={200: EmailPreferenceSerializer(), 400: "Validation error"},
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def get_object(self):
        preferences, created = EmailNotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences
