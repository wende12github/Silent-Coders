from venv import logger
from bookings.models import Tag
from rest_framework import serializers
from django.contrib.auth import get_user_model

from users.models import User, AvailabilityChoices

from skills.models import LEVEL_CHOICES, LOCATION_CHOICES, Skill


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "profile_picture",
            "date_joined",
            "availability",
        ]
        read_only_fields = fields


class TagSlugRelatedField(serializers.SlugRelatedField):

    def to_internal_value(self, data):
        logger.debug(
            f"Processing tag data in TagSlugRelatedField: {data} (Type: {type(data)})"
        )

        if not isinstance(data, str):
            logger.error(f"Invalid tag data type: Expected string, got {type(data)}")

            raise serializers.ValidationError("Each tag must be a string.")

        tag_name_lower = data.lower()
        try:

            tag_obj, created = Tag.objects.get_or_create(name=tag_name_lower)
            if created:
                logger.info(f"Tag '{tag_name_lower}' created.")
            else:
                logger.debug(f"Tag '{tag_name_lower}' found.")
            return tag_obj
        except Tag.DoesNotExist:

            logger.error(f"Tag.DoesNotExist unexpectedly raised for tag: {data}")
            raise serializers.ValidationError(
                f"Internal Error: Tag '{data}' not found after get_or_create attempt."
            )
        except Exception as e:
            logger.error(
                f"Unexpected error during tag get_or_create for '{data}': {e}",
                exc_info=True,
            )
            raise serializers.ValidationError(f'Error processing tag "{data}": {e}')


class SkillSerializer(serializers.ModelSerializer):

    user = UserProfileSerializer(read_only=True)

    tags = TagSlugRelatedField(
        many=True,
        slug_field="name",
        queryset=Tag.objects.all(),
        allow_empty=True,
        required=False,
    )

    level = serializers.ChoiceField(choices=LEVEL_CHOICES, read_only=True)
    endorsements = serializers.IntegerField(read_only=True)
    experience_hours = serializers.FloatField(read_only=True)

    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    is_offered = serializers.BooleanField(required=False)
    location = serializers.ChoiceField(choices=LOCATION_CHOICES)
    address = serializers.CharField(
        max_length=255, required=False, allow_blank=True, allow_null=True
    )

    is_visible = serializers.BooleanField(required=False)

    class Meta:
        model = Skill
        fields = [
            "id",
            "user",
            "name",
            "description",
            "is_offered",
            "location",
            "address",
            "tags",
            "is_visible",
            "level",
            "endorsements",
            "experience_hours",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "level",
            "endorsements",
            "experience_hours",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags", [])

        skill = Skill.objects.create(**validated_data)

        skill.tags.set(tags_data)

        return skill

    def update(self, instance, validated_data):
        tags_data = validated_data.pop("tags", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.set(tags_data)

        return instance


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "bio",
            "profile_picture",
            "availability",
            "date_joined",
            "skills",
        ]
        read_only_fields = ("id", "date_joined", "skills")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    availability = serializers.ChoiceField(
        choices=AvailabilityChoices.choices, required=False
    )
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "bio",
            "availability",
            "profile_picture",
        ]


class PublicUserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "profile_picture",
            "bio",
            "skills",
            "availability",
        ]
        read_only_fields = fields
