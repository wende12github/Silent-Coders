from bookings.models import Booking, BookingStatus
from .models import UserStats
from decimal import Decimal


def update_stats_for_service_provider(user):
    """
    Updates UserStats for a user based on completed bookings where they were the service provider (booked_for).
    """

    completed_bookings_as_provider = Booking.objects.filter(
        booked_for=user, status=BookingStatus.COMPLETED
    )

    total_minutes_given = sum([b.duration for b in completed_bookings_as_provider])
    total_hours_given = Decimal(total_minutes_given / 60).quantize(Decimal("0.01"))

    sessions_completed_as_provider = completed_bookings_as_provider.count()

    stats, created = UserStats.objects.get_or_create(user=user)

    stats.total_hours_given = total_hours_given
    stats.sessions_completed = sessions_completed_as_provider
    stats.save()


def update_stats_for_service_booker(user):
    """
    Updates UserStats for a user based on completed bookings where they were the booker (booked_by).
    """

    completed_bookings_as_booker = Booking.objects.filter(
        booked_by=user, status=BookingStatus.COMPLETED
    )

    total_minutes_received = sum([b.duration for b in completed_bookings_as_booker])
    total_hours_received = Decimal(total_minutes_received / 60).quantize(
        Decimal("0.01")
    )

    stats, created = UserStats.objects.get_or_create(user=user)

    stats.total_hours_received = total_hours_received
    stats.save()
