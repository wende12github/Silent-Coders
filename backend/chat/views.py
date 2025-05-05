from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.contrib.auth import get_user_model
import google.generativeai as genai
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.response import Response
from .models import ChatMessage, PrivateChatMessage
from .serializers import ChatMessageSerializer, PrivateChatMessageSerializer
from django.db.models import Q
from groups.models import Group

User =  get_user_model()

class GroupChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_name):
        limit = int(request.query_params.get("limit", 20))
        offset = int(request.query_params.get("offset", 0))

        try:
            group = Group.objects.get(name=group_name)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(room=group).order_by('-created_at')[offset:offset + limit]
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class PrivateChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        limit = int(request.query_params.get("limit", 20))
        offset = int(request.query_params.get("offset", 0))

        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        messages = PrivateChatMessage.objects.filter(
            Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user)
        ).order_by('-created_at')[offset:offset + limit]

        serializer = PrivateChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        is_group_chat = request.data.get("is_group_chat", False)
        message = request.data.get("message")
        room_name = request.data.get("room_name")
        other_user_id = request.data.get("other_user_id")  # Get the user ID from the request data

        if not message or not room_name:
            return Response({"error": "Message and room_name are required"}, status=status.HTTP_400_BAD_REQUEST)

        if is_group_chat:
            try:
                # Get the group based on room_name
                group = Group.objects.get(name=room_name)
                
                chat_message = ChatMessage(user=request.user, room=group, message=message, message_tyep="text")
                chat_message.save()
                serializer = ChatMessageSerializer(chat_message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Group.DoesNotExist:
                return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        else:
            if not other_user_id:
                return Response({"error": "other_user_id is required for private chat"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Ensure other_user_id is an integer
                other_user_id = int(other_user_id) 
                
                # Get the receiver user
                receiver = User.objects.get(id=other_user_id)
                
                # Create a private message
                private_message = PrivateChatMessage(sender=request.user, receiver=receiver, message=message, message_type="text")
                private_message.save()
                serializer = PrivateChatMessageSerializer(private_message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError:
                # If 'other_user_id' is not a valid integer
                return Response({"error": "Invalid user ID"}, status=status.HTTP_400_BAD_REQUEST)
            
            except User.DoesNotExist:

                # If receiver user doesn't exist
                return Response({"error": "Receiver user not found"}, status=status.HTTP_404_NOT_FOUND)

# Here Google API key is defined after set in Django settings
GOOGLE_API_KEY = getattr(settings, "GEMINAI_API_KEY", None)

class ChatBotView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="AI Assistant Chat",
        operation_description="Send a message to the TimeBank AI assistant powered by Gemini.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["message"],
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING, description="User message for the AI chatbot.")
            },
        ),
        responses={
            200: openapi.Response(
                description="Successful response from chatbot",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "reply": openapi.Schema(type=openapi.TYPE_STRING, description="AI assistant's response.")
                    },
                ),
            ),
            400: "Bad request (missing message)",
            500: "Internal server error",
        }
    )

    def post(self, request):
        try:
            user_message = request.data.get("message")

            if not user_message:
                return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

            if not GOOGLE_API_KEY:
                return Response({"error": "Missing Google API Key"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Configure Gemini client
            genai.configure(api_key=GOOGLE_API_KEY)

            # Initialize model
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")

            # System prompt: tailored instructions for chatbot
            system_prompt = (
                "You are an AI assistant in a TimeBank platform. "
                "Your job is to help users navigate the platform, suggest sessions to join, recommend users with skills, "
                "and advise how to earn or spend time credits. You can also recommend skill improvements. "
                "Keep your responses clear, friendly, and concise."
            )

            # Here Generate content and intract with user
            prompt = f"{system_prompt}\n\nUser: {user_message}"
            response = model.generate_content(prompt)

            # response = model.generate_content([
            #     {"role": "system", "parts": [system_prompt]},
            #     {"role": "user", "parts": [user_message]}
            # ])

            return Response({"reply": response.text}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
