from rest_framework import serializers
from .models import Group, GroupMembership
from django.core.exceptions import ValidationError

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'owner', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def create(self, validated_data):
        # Automatically assign the request user as the group owner
        group = Group.objects.create(owner=self.context['request'].user, **validated_data)
        
        # Add owner as a member of the group with the 'accepted' status
        GroupMembership.objects.create(user=self.context['request'].user, group=group, status='accepted')
        return group

class GroupInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Ensure the user is not already a member of the group
        group = self.context.get('group')
        if group.members.filter(email=value).exists():
            raise ValidationError("User is already a member of this group.")
        return value

class GroupDetailSerializer(GroupSerializer):
    members = serializers.SerializerMethodField()

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members']

    def get_members(self, obj):
        # You can return more details like the role of each member
        return [
            {
                "email": member.email,
                "name": member.get_full_name(),
                "status": member.membership.status  # Assuming 'membership' is a related name from GroupMembership
            }
            for member in obj.members.all()
        ]
