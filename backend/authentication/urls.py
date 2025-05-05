from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,LogoutView, CurrentUserView,UserSkillListView,EndorseUserSkillView,
    UpdateProfileView,UpdatePasswordView, UpdateEmailPreferencesView, PublicUserDetailView
)

app_name = 'authentication'

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/me/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('auth/me/password/', UpdatePasswordView.as_view(), name='update-password'),
    path('auth/me/preferences/', UpdateEmailPreferencesView.as_view(), name='update-email-preferences'),
    path('skills/', UserSkillListView.as_view(), name='user-skills'),
    path('skills/<int:pk>/endorse/', EndorseUserSkillView.as_view(), name='endorse-skill'),
    path("users/<int:pk>/", PublicUserDetailView.as_view(), name="user-detail")

]
