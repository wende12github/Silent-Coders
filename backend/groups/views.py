from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
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


class GroupInviteView(generics.GenericAPIView):
    serializer_class = GroupInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        # Only owner can invite
        if request.user != group.owner:
            raise PermissionDenied("Only the group owner can invite users.")

        # Inject group into serializer context
        serializer = self.get_serializer(data=request.data, context={'group': group})
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        membership, created = GroupMembership.objects.get_or_create(
            user=user,
            group=group,
            defaults={'invited_by': request.user}
        )

        if not created:
            return Response({"message": "User is already in the group."}, status=status.HTTP_200_OK)

        return Response({"message": f"{email} has been invited to the group."}, status=status.HTTP_201_CREATED)
