from django.urls import path
from .views import GroupCreateView, GroupJoinView, GroupLeaderboardViewSet, GroupListAPIView, MyGroupsListView, GroupDetailView

app_name = 'groups'

urlpatterns = [
    path('', GroupListAPIView.as_view(), name='group-list'),
    path('create/', GroupCreateView.as_view(), name='group-create'),
    path('my-groups/', MyGroupsListView.as_view(), name='my-groups'),
    path('<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('<int:pk>/join/', GroupJoinView.as_view(), name='group-join'),
    path('<int:pk>/leaderboard/', GroupLeaderboardViewSet.as_view({'get': 'list'}), name='group-leaderboard'),
]