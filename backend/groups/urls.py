from django.urls import path
from .views import (
    GroupCreateView,
    GroupJoinView,
    GroupLeaderboardViewSet,
    GroupListAPIView,
    MyGroupsListView,
    GroupDetailView,
    GroupUpdateView,
    GroupAnnouncementListCreateView,
)

app_name = "groups"

urlpatterns = [
    path("", GroupListAPIView.as_view(), name="group-list"),
    path("create/", GroupCreateView.as_view(), name="group-create"),
    path("my/", MyGroupsListView.as_view(), name="my-groups"),
    path("<int:pk>/", GroupDetailView.as_view(), name="group-detail"),
    path("<int:pk>/update/", GroupUpdateView.as_view(), name="group-update"),
    path("<int:pk>/join/", GroupJoinView.as_view(), name="group-join"),
    path(
        "<int:group_id>/leaderboard/",
        GroupLeaderboardViewSet.as_view({"get": "list"}),
        name="group-leaderboard",
    ),
    path(
        "<int:group_id>/announcements/",
        GroupAnnouncementListCreateView.as_view(),
        name="group-announcements",
    ),
]
