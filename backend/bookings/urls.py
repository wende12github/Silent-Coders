# booking/urls.py
from django.urls import path
from .views import BookingCreateView, BookingDetailView, BookingListView, BookingConfirmView, BookingCancelView, BookingCompleteView, BookingRescheduleView, MyBookingsView


urlpatterns = [
    path('booking/', BookingCreateView.as_view(), name='booking-request'),
    path('bookings/list/', BookingListView.as_view(), name='booking-list'),
    path('my/bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/reschedule/', BookingRescheduleView.as_view(), name='booking-reschedule'),
    path('bookings/<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('bookings/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('bookings/<int:pk>/complete/', BookingCompleteView.as_view(), name='booking-complete'),
]