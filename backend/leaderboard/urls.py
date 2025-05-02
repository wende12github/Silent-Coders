# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaderboardViewSet

router = DefaultRouter()
router.register(r'', LeaderboardViewSet, basename='leaderboard')

urlpatterns = [
    path('', include(router.urls)),  # Include the automatically generated URLs for the leaderboard
]
