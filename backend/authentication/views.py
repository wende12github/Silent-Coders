from tokenize import TokenError
from rest_framework import status, generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer, TokenObtainPairSerializer, UserSerializer, UserProfileSerializer, UserSkillSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import UserSerializer, UserProfileSerializer, UserSkillSerializer
from .models import UserSkill
from django.contrib.auth import get_user_model
from notifications.services import notify_user


User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    @swagger_auto_schema(request_body=UserSerializer)

    def post(self, request):
        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "User created successfully"}, status=201)

class UserLoginView(APIView):
    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
            },
            required=['refresh_token']
        )
    )
    def post(self, request):
        refresh_token = request.data.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user
class UserSkillListView(generics.ListCreateAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EndorseUserSkillView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            skill = UserSkill.objects.get(pk=pk)
            key = f"endorsed:{request.user.id}:{skill.id}"

            if request.session.get(key):
                return Response({"detail": "Already endorsed."}, status=status.HTTP_400_BAD_REQUEST)

            skill.endorsements += 1
            skill.save()
            request.session[key] = True
            notify_user(skill.user, "review", f"Your skill '{skill.skill.name}' was endorsed!")
            return Response(UserSkillSerializer(skill).data)

        except UserSkill.DoesNotExist:
            return Response({"detail": "Skill not found."}, status=status.HTTP_404_NOT_FOUND)