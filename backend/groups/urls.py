from django.urls import path
from .views import GroupCreateView, MyGroupsListView, GroupDetailView, GroupInviteView

app_name = 'groups'

urlpatterns = [
    path('', GroupCreateView.as_view(), name='group-create'),
    path('my-groups/', MyGroupsListView.as_view(), name='my-groups'),
    path('<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('<int:pk>/invite/', GroupInviteView.as_view(), name='group-invite'),
]