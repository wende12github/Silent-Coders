# asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
# Removed direct imports of Django auth models here
# from django.contrib.auth.models import AnonymousUser
# from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "timebank.settings")

# Get the Django ASGI application - this should configure settings
# This call must happen *before* any code that requires settings to be configured.
django_asgi_app = get_asgi_application()

# Import your consumer
from message import consumers
from channels.db import database_sync_to_async
# Custom middleware to authenticate users based on JWT token in query params
class TokenAuthMiddleware:
    """
    Custom middleware that authenticates users based on a JWT token
    provided in the 'token' query parameter of the WebSocket URL.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Import necessary components here, inside the callable method
        # This delays their execution until the middleware is actually run,
        # by which point settings should be configured by get_asgi_application().
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
            from django.contrib.auth import get_user_model
            from django.contrib.auth.models import AnonymousUser
        except ImportError as e:
            print(f"Error importing necessary modules for token authentication: {e}")
            # Assign AnonymousUser and proceed, or close the connection
            scope['user'] = AnonymousUser()
            return await self.inner(scope, receive, send)
        except Exception as e:
             # Catch any other unexpected errors during import
             print(f"An unexpected error occurred during module import: {e}")
             scope['user'] = AnonymousUser()
             return await self.inner(scope, receive, send)


        # Look for the 'token' query parameter
        query_string = scope.get('query_string', b'').decode()
        query_parameters = {}
        # Safely parse query string
        for qp in query_string.split('&'):
            if '=' in qp:
                key, value = qp.split('=', 1)
                query_parameters[key] = value

        token = query_parameters.get('token')

        # Get the User model after settings are configured
        User = get_user_model()

        if token:
            try:
                # Example of manual validation (requires rest_framework_simplejwt):
                access_token = AccessToken(token)
                user_id = access_token['user_id']

                # Fetch the user from the database asynchronously
                scope['user'] = await database_sync_to_async(User.objects.get)(id=user_id)
                print(f"Authenticated user {scope['user'].username} via token.")

            except (InvalidToken, TokenError, User.DoesNotExist) as e:
                # Handle invalid token or user not found
                print(f"Token authentication failed: {e}")
                scope['user'] = AnonymousUser() # Assign AnonymousUser on failure
            except Exception as e:
                 # Catch any other unexpected errors during authentication
                 print(f"An unexpected error occurred during token authentication: {e}")
                 scope['user'] = AnonymousUser() # Assign AnonymousUser on failure
        else:
            # No token provided, assign AnonymousUser
            scope['user'] = AnonymousUser()
            print("No token provided for WebSocket connection.")


        # Call the next middleware/application in the stack
        return await self.inner(scope, receive, send)

# Wrap the URLRouter with AuthMiddlewareStack which now includes our custom middleware
# We place our custom middleware *inside* AuthMiddlewareStack so it can set the user
# on the scope before the consumer is reached.
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack( # AuthMiddlewareStack handles session auth by default
             TokenAuthMiddleware( # Our custom token middleware
                URLRouter(
                    [
                        path(
                            "ws/chat/group/<int:group_id>/",
                            consumers.ChatConsumer.as_asgi(),
                        ),
                        path(
                            "ws/chat/user/<str:user_ids>/", consumers.ChatConsumer.as_asgi()
                        ),
                    ]
                )
             )
        ),
    }
)
