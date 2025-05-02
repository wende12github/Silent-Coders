# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaderboardViewSet

router = DefaultRouter()
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')

urlpatterns = [
    path('api/', include(router.urls)),  # Include the automatically generated URLs for the leaderboard
]
