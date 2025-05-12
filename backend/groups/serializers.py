from rest_framework import serializers
from .models import Group, GroupMembership, UserStats, GroupAnnouncement
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_serializer_method

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
        ]
        read_only_fields = fields


class GroupListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "member_count",
            "image",
            "created_at",
        ]

    def get_member_count(self, obj):
        return obj.groupmembership_set.filter(is_active=True).count()


class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["user", "joined_at"]


class GroupSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "owner", "image", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

    def create(self, validated_data):
        request_user = self.context["request"].user

        image = validated_data.pop("image", None)

        group = Group.objects.create(owner=request_user, **validated_data)

        if image:
            group.image = image
            group.save()

        GroupMembership.objects.create(user=request_user, group=group, is_active=True)

        return group


class GroupUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Group
        fields = ["name", "description", "image"]


class GroupDetailSerializer(GroupSerializer):
    members = serializers.SerializerMethodField()
    owner = UserSerializer(read_only=True)
    image = serializers.ImageField(read_only=True)

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ["members"]

    @swagger_serializer_method(serializer_or_field=GroupMemberSerializer(many=True))
    def get_members(self, obj):
        memberships = obj.groupmembership_set.filter(is_active=True)

        return GroupMemberSerializer(memberships, many=True).data


class EmptySerializer(serializers.Serializer):
    pass


class GroupLeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    net_contribution = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            "user",
            "total_hours_given",
            "total_hours_received",
            "sessions_completed",
            "net_contribution",
        ]

    def get_net_contribution(self, obj):
        return obj.total_hours_given - obj.total_hours_received


class GroupAnnouncementSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)

    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), write_only=True
    )

    class Meta:
        model = GroupAnnouncement
        fields = ["id", "group", "title", "message", "created_at", "posted_by"]
        read_only_fields = ["id", "created_at", "posted_by"]
