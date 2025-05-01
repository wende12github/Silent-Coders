# groups/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Group, GroupMembership
from .serializers import GroupSerializer, GroupDetailSerializer, GroupInviteSerializer

User = get_user_model()

class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class MyGroupsListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.groups.all()

class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        group = super().get_object()
        if self.request.user not in group.members.all():
            self.permission_denied(self.request, message="You are not a member of this group.")
        return group

class GroupInviteView(generics.GenericAPIView):
    serializer_class = GroupInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        group = Group.objects.get(pk=pk)
        if request.user != group.owner:
            return Response({"error": "Only group owner can invite."}, status=403)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        GroupMembership.objects.get_or_create(user=user, group=group, invited_by=request.user)
        return Response({"message": f"{email} added to group."})
