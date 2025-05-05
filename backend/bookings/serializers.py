from django.utils.timezone import now
from datetime import timedelta, timezone
from bookings.models import AvailabilitySlot, Booking, BookingStatus,Review
from rest_framework import serializers
from datetime import timedelta

from skills.serializers import SkillSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    availability_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Booking
        fields = ['id', 'booked_for', 'skill', 'scheduled_time', 'duration', 'availability_id']

    def validate(self, data):
        scheduled_time = data['scheduled_time']
        duration = data['duration']
        booked_for = data['booked_for']

        if scheduled_time <= now():
            raise serializers.ValidationError("Scheduled time must be in the future.")

        end_time = scheduled_time + timedelta(minutes=duration)
        # weekday = scheduled_time.weekday()

        # # Force UTC extraction
        # start_clock = scheduled_time.astimezone(timezone.utc).time()
        # end_clock = end_time.astimezone(timezone.utc).time()

        # available = AvailabilitySlot.objects.filter(
        #     booked_for=booked_for,
        #     weekday=weekday,
        #     start_time__lte=start_clock,
        #     end_time__gte=end_clock
        # ).exists()

        # if not available:
        #     raise serializers.ValidationError("booked_for is not available during the selected time.")

        # Prevent overlapping bookings
        # overlap = Booking.objects.filter(
        #     booked_for=booked_for,
        #     scheduled_time__lt=end_time,
        #     status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        # ).filter(
        #     scheduled_time__gte=scheduled_time - timedelta(minutes=duration)
        # ).exists()

        # if overlap:
        #     raise serializers.ValidationError("booked_for has another booking that overlaps with this time.")

        availability_id = data.get('availability_id')
        try:
            availability = AvailabilitySlot.objects.get(id=availability_id, is_booked=False)
        except AvailabilitySlot.DoesNotExist:
            raise serializers.ValidationError("Invalid or already booked availability slot.")

        data['availability'] = availability
        return data

    def create(self, validated_data):
        booked_by = self.context['request'].user
        availability = validated_data.pop('availability')
        booking = Booking.objects.create(booked_by=booked_by, status=BookingStatus.PENDING, **validated_data)
        availability.is_booked = True
        availability.save()
        return booking
        

class BookingActionSerializer(serializers.ModelSerializer):
    cancel_reason = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Booking
        fields = ['id', 'status', 'cancel_reason']

    def validate(self, data):
        status = data.get('status')

        if status == BookingStatus.CANCELLED and not data.get('cancel_reason'):
            raise serializers.ValidationError({"cancel_reason": "This field is required when cancelling a booking."})
        elif status != BookingStatus.CANCELLED and 'cancel_reason' in data:
            raise serializers.ValidationError({"cancel_reason": "This field is only allowed when cancelling."})


        return data

    def update(self, instance, validated_data):
        new_status = validated_data['status']
        instance.status = new_status

        if new_status == BookingStatus.CANCELLED:
            instance.cancel_reason = validated_data.get('cancel_reason', '')
        else:
            # Clear any existing cancel reason if status is not CANCELLED
            instance.cancel_reason = None

        instance.save()
        return instance

class BookingDetailSerializer(serializers.ModelSerializer):
    booked_by = serializers.StringRelatedField()
    booked_for = serializers.StringRelatedField()
    skill = SkillSerializer(read_only=True)


    class Meta:
        model = Booking
        fields = '__all__'


class BookingRescheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['scheduled_time', 'duration']

    def validate(self, data):
        if self.instance.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            raise serializers.ValidationError("Only pending or confirmed bookings can be rescheduled.")
        if data['scheduled_time'] <= now():
            raise serializers.ValidationError("Scheduled time must be in the future.")
        return data

    def update(self, instance, validated_data):
        instance.scheduled_time = validated_data.get('scheduled_time', instance.scheduled_time)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.save()
        return instance


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'reviewer', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at', 'booking']

class ReviewListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'reviewer', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'booking', 'reviewer', 'created_at']

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    is_booked = serializers.BooleanField(read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'booked_for', 'weekday', 'start_time', 'end_time', 'is_booked']
        read_only_fields = ['booked_for', 'is_booked']

    def create(self, validated_data):
        validated_data['booked_for'] = self.context['request'].user
        return super().create(validated_data)


class BookingCancelSerializer(serializers.ModelSerializer):
    cancel_reason = serializers.CharField(required=True)

    class Meta:
        model = Booking
        fields = ['id', 'status', 'cancel_reason']

    def validate(self, data):
        if data.get('status') != BookingStatus.CANCELLED:
            raise serializers.ValidationError({"status": "Status must be CANCELLED when cancelling."})
        return data

    def update(self, instance, validated_data):
        instance.status = BookingStatus.CANCELLED
        instance.cancel_reason = validated_data.get('cancel_reason')
        instance.save()
        return instance

class BookingStatusOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'status']

    def validate(self, data):
        if data.get('status') == BookingStatus.CANCELLED:
            raise serializers.ValidationError({"status": "Use the cancel endpoint to cancel a booking."})
        return data

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.cancel_reason = None  # Clear any existing cancel reason
        instance.save()
        return instance
