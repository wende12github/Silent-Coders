from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import google.generativeai as genai
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

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
