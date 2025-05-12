from django.urls import path
from .views import (
    AvailabilitySlotDetailView,
    AvailabilitySlotListCreateView,
    BookingCreateView,
    BookingDetailView,
    BookingListView,
    BookingStatusUpdateView,
    BookingRescheduleView,
    SubmitReviewView,
    UserAvailabilityView,
    ReviewListView,
    TagListView,
)

app_name = 'bookings'

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('list/', BookingListView.as_view(), name='booking-list'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking-status-update'),
    path('<int:pk>/reschedule/', BookingRescheduleView.as_view(), name='booking-reschedule'),
    path('reviews/', ReviewListView.as_view(), name='review-list'), # Review list/filter endpoint
    path('<int:pk>/review/', SubmitReviewView.as_view(), name='submit-review'), # Submit review for a specific booking

    path('availability/', AvailabilitySlotListCreateView.as_view(), name='availability-list-create'),
    path('availability/<int:pk>/', AvailabilitySlotDetailView.as_view(), name='availability-detail'),
    path('availability/user/<int:user_id>/', UserAvailabilityView.as_view(), name='user-availability'),

    path('tags/', TagListView.as_view(), name='tag-list'),
]