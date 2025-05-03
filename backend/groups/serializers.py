from rest_framework import serializers
from .models import Group, GroupMembership, UserStats
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_serializer_method

User = get_user_model()

class GroupMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField()
    status = serializers.CharField()

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

class GroupDetailSerializer(GroupSerializer):
    members = serializers.SerializerMethodField()

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members']

    @swagger_serializer_method(serializer_or_field=GroupMemberSerializer(many=True))
    def get_members(self, obj):
        return GroupMemberSerializer([
            {
                "email": member.email,
                "name": member.get_full_name(),
                "status": member.groupmembership.status  # note this access
            }
            for member in obj.members.all()
        ], many=True).data

class EmptySerializer(serializers.Serializer):
    pass

class GroupLeaderboardSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    net_contribution = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            'user',
            'total_hours_given',
            'total_hours_received',
            'sessions_completed',
            'net_contribution',
        ]
    
    def get_user(self, obj):
        # Include full user details as needed
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'full_name': f"{obj.user.first_name} {obj.user.last_name}",
            'profile_picture': obj.user.profile_picture.url if obj.user.profile_picture else None,
            'bio': obj.user.bio,
            'date_joined': obj.user.date_joined,
        }

    def get_net_contribution(self, obj):
        return obj.total_hours_given - obj.total_hours_received