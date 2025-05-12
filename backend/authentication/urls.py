# authentication/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    LogoutView,
    UpdatePasswordView,
    UpdateEmailPreferencesView,
)

app_name = 'authentication'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('', include('users.urls')),

    path('me/password/', UpdatePasswordView.as_view(), name='update-password'),
    path('me/preferences/', UpdateEmailPreferencesView.as_view(), name='update-email-preferences'),
]
