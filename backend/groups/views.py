from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Group, GroupMembership
from .serializers import GroupSerializer, GroupDetailSerializer

User = get_user_model()


class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyGroupsListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.custom_groups.all()  # Use related_name from Group.members


class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        group = super().get_object()
        if not group.members.filter(pk=self.request.user.pk).exists():
            raise PermissionDenied("You are not a member of this group.")
        return group

class GroupJoinView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        # Ensure the user is not already a member of the group
        if group.members.filter(pk=request.user.pk).exists():
            return Response({"message": "You are already a member of this group."}, status=status.HTTP_200_OK)

        # Add the user as a member with 'accepted' status
        GroupMembership.objects.create(user=request.user, group=group)

        return Response({"message": f"You have successfully joined the group {group.name}."}, status=status.HTTP_201_CREATED)

