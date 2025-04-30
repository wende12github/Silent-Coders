# booking/urls.py
from django.urls import path
from .views import BookingCreateView, BookingListView, BookingConfirmView, BookingCancelView, BookingCompleteView

urlpatterns = [
  path('booking/', BookingCreateView.as_view(), name='booking-request'),          
  path('booking/list/', BookingListView.as_view(), name='booking-list'),          
  path('booking/<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
  path('booking/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
  path('booking/<int:pk>/complete/', BookingCompleteView.as_view(), name='booking-complete'),

]

