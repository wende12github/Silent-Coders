from django.utils.timezone import now
from datetime import timedelta, timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

from .models import AvailabilitySlot, Booking, BookingStatus, Review, Skill, Tag
from users.serializers import SkillSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]
        read_only_fields = fields
        ref_name = "BookingUser"


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    is_booked = serializers.BooleanField(read_only=True)
    weekday_display = serializers.CharField(
        source="get_weekday_display", read_only=True
    )

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "booked_for",
            "weekday",
            "weekday_display",
            "start_time",
            "end_time",
            "is_booked",
        ]
        read_only_fields = ["booked_for", "is_booked"]

    def create(self, validated_data):
        validated_data["booked_for"] = self.context["request"].user
        return super().create(validated_data)

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    availability_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "booked_for",
            "skill",
            "scheduled_time",
            "duration",
            "availability_id",
        ]
        read_only_fields = ["id"]

    def validate(self, data):
        scheduled_time = data.get("scheduled_time")
        duration = data.get("duration")
        booked_for = data.get("booked_for")
        availability_id = data.get("availability_id")

        if scheduled_time and scheduled_time <= now():
            raise serializers.ValidationError("Scheduled time must be in the future.")

        try:
            availability = AvailabilitySlot.objects.get(
                id=availability_id, is_booked=False
            )

        except AvailabilitySlot.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid or already booked availability slot."
            )

        if availability.booked_for != booked_for:
            raise serializers.ValidationError(
                "Availability slot does not belong to the specified booked_for user."
            )

        data["availability"] = availability
        return data

    def create(self, validated_data):
        booked_by = self.context["request"].user

        availability = validated_data.pop("availability")

        validated_data.pop("booked_by", None)

        booking = Booking.objects.create(
            booked_by=booked_by,
            status=BookingStatus.PENDING,
            availability=availability,
            **validated_data,
        )

        return booking


class BookingDetailSerializer(serializers.ModelSerializer):
    booked_by = UserSerializer(read_only=True)
    booked_for = UserSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)
    availability = AvailabilitySlotSerializer(read_only=True)
    review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"

    def get_review(self, obj):
        review = getattr(obj, "review", None)
        if review:
            return ReviewSerializer(review).data
        return None


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    cancel_reason = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    status = serializers.ChoiceField(choices=BookingStatus.CHOICES)

    class Meta:
        model = Booking
        fields = ["id", "status", "cancel_reason"]
        read_only_fields = ["id"]

    def validate(self, data):
        status = data.get("status")
        cancel_reason = data.get("cancel_reason")
        instance = self.instance

        if not instance:
            raise serializers.ValidationError("Booking instance not provided.")

        user = self.context["request"].user

        if status == BookingStatus.CONFIRMED and user != instance.booked_for:
            raise serializers.ValidationError(
                {"status": "Only the person booked for can confirm a booking."}
            )

        if status == BookingStatus.COMPLETED and user == instance.booked_for:
            raise serializers.ValidationError(
                {
                    "status": "Only the person that booked the session can mark a booking as completed."
                }
            )

        if status == BookingStatus.CANCELLED and user not in [
            instance.booked_by,
            instance.booked_for,
        ]:
            raise serializers.ValidationError(
                {
                    "status": "Only the person booked by or booked for can cancel a booking."
                }
            )

        if status == BookingStatus.CANCELLED and not cancel_reason:
            raise serializers.ValidationError(
                {"cancel_reason": "Cancel reason is required when cancelling."}
            )

        if instance.status in [
            BookingStatus.CANCELLED,
            BookingStatus.COMPLETED,
        ] and status not in [instance.status]:
            raise serializers.ValidationError(
                {"status": f"Cannot change status from {instance.status}."}
            )

        if (
            status == BookingStatus.CONFIRMED
            and instance.status != BookingStatus.PENDING
        ):
            raise serializers.ValidationError(
                {"status": "Only pending bookings can be confirmed."}
            )

        if (
            status == BookingStatus.COMPLETED
            and instance.status != BookingStatus.CONFIRMED
        ):
            raise serializers.ValidationError(
                {"status": "Only confirmed bookings can be marked as completed."}
            )

        return data

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class BookingRescheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["scheduled_time", "duration"]

    def validate(self, data):
        instance = self.instance
        user = self.context["request"].user

        if not instance:
            raise serializers.ValidationError("Booking instance not provided.")

        if user not in [instance.booked_by, instance.booked_for]:
            raise serializers.ValidationError(
                "Only the person booked by or booked for can reschedule the booking."
            )

        if instance.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            raise serializers.ValidationError(
                "Only pending or confirmed bookings can be rescheduled."
            )

        scheduled_time = data.get("scheduled_time")
        if scheduled_time and scheduled_time <= now():
            raise serializers.ValidationError("Scheduled time must be in the future.")

        return data

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)

    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(), source="booking", write_only=True
    )

    rating = serializers.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )

    class Meta:
        model = Review
        fields = ["id", "booking_id", "reviewer", "rating", "comment", "created_at"]
        read_only_fields = ["id", "reviewer", "created_at"]

    def validate(self, data):
        booking = data.get("booking")

        if not booking:
            raise serializers.ValidationError({"booking_id": "Booking not found."})

        user = self.context["request"].user

        if booking.booked_by != user:
            raise serializers.ValidationError(
                {"booking_id": "You can only review bookings you made."}
            )

        if booking.status != BookingStatus.COMPLETED:
            raise serializers.ValidationError(
                {"booking_id": "You can only review completed bookings."}
            )

        if hasattr(booking, "review"):
            raise serializers.ValidationError(
                {"booking_id": "This booking already has a review."}
            )

        return data

    def create(self, validated_data):
        return super().create(validated_data)


class ReviewListSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)

    booking_id = serializers.IntegerField(source="booking.id", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "booking_id", "reviewer", "rating", "comment", "created_at"]
        read_only_fields = ["id", "booking_id", "reviewer", "created_at"]
