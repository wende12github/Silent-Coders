from django.utils import timezone
from bookings.models import Booking, BookingStatus
from rest_framework import serializers

class BookingCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = Booking
    fields = ['id', 'provider', 'service_offering', 'scheduled_time', 'duration']

  def validate(self, data):
    if data['scheduled_time'] <= timezone.now():
      raise serializers.ValidationError("Scheduled time must be in the future")
    return data
  
  def create(self, validated_data):
    requester = self.context['request'].user
    return Booking.objects.create(requester=requester, status=BookingStatus.PENDING, **validated_data)
  


class BookingActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'status']

    def validate(self, data):
        # Ensure only valid transitions
        new_status = data.get('status')
        current_status = self.instance.status

        if current_status == BookingStatus.COMPLETED:
            raise serializers.ValidationError("Cannot update a completed booking.")
        if current_status == BookingStatus.CANCELLED:
            raise serializers.ValidationError("Cannot update a cancelled booking.")

        if new_status not in [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
            raise serializers.ValidationError("Invalid status update.")

        return data

    def update(self, instance, validated_data):
        instance.status = validated_data['status']
        instance.save()
        return instance