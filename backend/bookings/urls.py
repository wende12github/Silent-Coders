# booking/urls.py
from django.urls import path
from .views import AvailabilitySlotDetailView, AvailabilitySlotListCreateView, BookingCreateView, BookingDetailView, BookingListView, BookingConfirmView, BookingCancelView, BookingCompleteView, BookingRescheduleView, MyBookingsView, SubmitReviewView, UserAvailabilityView, ReviewListView

app_name = 'bookings'

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-request'),
    path('list/', BookingListView.as_view(), name='booking-list'),
    path('my/bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/reschedule/', BookingRescheduleView.as_view(), name='booking-reschedule'),
    path('<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('<int:pk>/complete/', BookingCompleteView.as_view(), name='booking-complete'),
    path('<int:pk>/review/', SubmitReviewView.as_view(), name='submit-review'),
    path('reviews/', ReviewListView.as_view(), name='review-list'),
    path('availability/', AvailabilitySlotListCreateView.as_view(), name='availability'),
    path('availability/', AvailabilitySlotListCreateView.as_view(), name='availability-list-create'),
    path('availability/<int:pk>/', AvailabilitySlotDetailView.as_view(), name='availability-detail'),
    path('availability/user/<int:user_id>/', UserAvailabilityView.as_view(), name='user-availability'),
]