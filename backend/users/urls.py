from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LogoutView, CurrentUserView,UserSkillListView,EndorseUserSkillView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('skills/', UserSkillListView.as_view(), name='user-skills'),
    path('skills/<int:pk>/endorse/', EndorseUserSkillView.as_view(), name='endorse-skill')



]
