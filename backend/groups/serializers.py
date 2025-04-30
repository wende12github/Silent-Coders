# groups/serializers.py
from rest_framework import serializers
from .models import Group, GroupMembership

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'owner', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def create(self, validated_data):
        group = Group.objects.create(owner=self.context['request'].user, **validated_data)
        GroupMembership.objects.create(user=self.context['request'].user, group=group)  # Add owner as member
        return group

class GroupInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()

class GroupDetailSerializer(GroupSerializer):
    members = serializers.SerializerMethodField()

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members']

    def get_members(self, obj):
        return [member.email for member in obj.members.all()]
