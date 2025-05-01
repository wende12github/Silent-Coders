from django.urls import path
from .views import GroupCreateView, MyGroupsListView, GroupDetailView, GroupInviteView

urlpatterns = [
    path('groups/', GroupCreateView.as_view(), name='group-create'),
    path('my-groups/', MyGroupsListView.as_view(), name='my-groups'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/<int:pk>/invite/', GroupInviteView.as_view(), name='group-invite'),
]