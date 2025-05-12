# chat/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import google.generativeai as genai
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# GOOGLE_API_KEY is defined after set in Django settings
GOOGLE_API_KEY = getattr(settings, "GEMINI_API_KEY", None)

class ChatBotView(APIView):
    permission_classes = [permissions.AllowAny] # Adjust permissions as needed

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
            500: "Internal server error (e.g., missing API key, API error)",
        }
    )
    def post(self, request):
        try:
            user_message = request.data.get("message")

            if not user_message:
                return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

            if not GOOGLE_API_KEY:
                # In a real application, avoid exposing internal errors like this publicly
                # Log the error and return a generic server error
                print("GEMINI_API_KEY not configured in settings.") # Log this server-side
                return Response({"error": "AI service is currently unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


            # Configure Gemini client
            genai.configure(api_key=GOOGLE_API_KEY)

            # Initialize model (consider moving model initialization outside the view for performance if stateful chat is needed)
            # For a simple request/response, initializing per request is fine.
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")

            # System prompt: tailored instructions for chatbot
            system_prompt = (
                "You are an AI assistant for a TimeBank platform. "
                "Assist users by providing information about the platform, suggesting activities, "
                "recommending users with specific skills, explaining how to earn or spend time credits, "
                "and offering advice on skill development. "
                "Keep your responses helpful, encouraging, and directly related to the TimeBank context. "
                "Be concise and friendly."
            )

            # Here Generate content and interact with user
            # Using the simple prompt concatenation method
            prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAI Assistant:"
            response = model.generate_content(prompt)

            # Access the text content of the response
            reply_text = response.text

            return Response({"reply": reply_text}, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the exception properly in a production environment
            print(f"Error in ChatBotView: {e}")
            return Response({"error": "An error occurred while processing your request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)