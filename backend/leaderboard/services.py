# leaderboard/services.py
from bookings.models import Booking, BookingStatus
from .models import UserStats

def update_user_stats(user):
    completed_bookings = Booking.objects.filter(booked_for=user, status=BookingStatus.COMPLETED)

    total_hours = sum([b.duration for b in completed_bookings])
    sessions = completed_bookings.count()

    stats, created = UserStats.objects.get_or_create(user=user)
    stats.total_hours_given = total_hours
    stats.sessions_completed = sessions
    stats.save()
