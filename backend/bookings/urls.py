# booking/urls.py
from django.urls import path
from .views import BookingCreateView, BookingDetailView, BookingListView, BookingConfirmView, BookingCancelView, BookingCompleteView, BookingRescheduleView, MyBookingsView

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
]