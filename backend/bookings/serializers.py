from django.utils import timezone
from bookings.models import AvailabilitySlot, Booking, BookingStatus,Review
from rest_framework import serializers
from datetime import timedelta

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'provider', 'service_offering', 'scheduled_time', 'duration']

    def validate(self, data):
        scheduled_time = data['scheduled_time']
        duration = data['duration']
        provider = data['provider']

        if scheduled_time <= timezone.now():
            raise serializers.ValidationError("Scheduled time must be in the future.")

        end_time = scheduled_time + timedelta(minutes=duration)
        weekday = scheduled_time.weekday()

        # Convert to time only
        start_clock = scheduled_time.time()
        end_clock = end_time.time()

        # Check provider availability
        available = AvailabilitySlot.objects.filter(
            provider=provider,
            weekday=weekday,
            start_time__lte=start_clock,
            end_time__gte=end_clock
        ).exists()

        if not available:
            raise serializers.ValidationError("Provider is not available during the selected time.")

        # (Optional) Prevent overlapping bookings for provider
        overlap = Booking.objects.filter(
            provider=provider,
            scheduled_time__lt=end_time,
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ).filter(
            scheduled_time__gte=scheduled_time - timedelta(minutes=duration)
        ).exists()

        if overlap:
            raise serializers.ValidationError("Provider has another booking that overlaps with this time.")

        return data

    def create(self, validated_data):
        requester = self.context['request'].user
        return Booking.objects.create(requester=requester, status=BookingStatus.PENDING, **validated_data)

class BookingActionSerializer(serializers.ModelSerializer):
    cancel_reason = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Booking
        fields = ['id', 'status', 'cancel_reason']

    def validate(self, data):
        new_status = data.get('status')
        current_status = self.instance.status

        if current_status == BookingStatus.COMPLETED:
            raise serializers.ValidationError("Cannot update a completed booking.")
        if current_status == BookingStatus.CANCELLED:
            raise serializers.ValidationError("Cannot update a cancelled booking.")

        if new_status not in [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
            raise serializers.ValidationError("Invalid status update.")

        if new_status == BookingStatus.CANCELLED and not data.get('cancel_reason'):
            raise serializers.ValidationError({"cancel_reason": "This field is required when cancelling a booking."})

        return data

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        if validated_data['status'] == BookingStatus.CANCELLED:
            instance.cancel_reason = validated_data.get('cancel_reason', '')
        instance.save()
        return instance

class BookingDetailSerializer(serializers.ModelSerializer):
    requester = serializers.StringRelatedField()
    provider = serializers.StringRelatedField()
    service_offering = serializers.StringRelatedField()

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
        if data['scheduled_time'] <= timezone.now():
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

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'provider', 'weekday', 'start_time', 'end_time']
        read_only_fields = ['provider']

    def create(self, validated_data):
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)