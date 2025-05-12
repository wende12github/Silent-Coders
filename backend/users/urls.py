from django.urls import path
from .views import CurrentUserView, PublicUserDetailView

app_name = "users"

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="me"),
    path("<int:pk>/", PublicUserDetailView.as_view(), name="user-detail"),
]
