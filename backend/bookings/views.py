from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import models
from .models import Booking, BookingStatus
from .serializers import BookingCreateSerializer, BookingActionSerializer


# Create your views here.
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

class BookingListView(generics.ListAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(models.Q(requester=user) | models.Q(provider=user))

class BookingConfirmView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingActionSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.provider:
            raise PermissionDenied("Only provider can confirm the booking.")
        if booking.status != BookingStatus.PENDING:
            raise ValidationError("Booking must be pending to confirm.")
        serializer.save(status=BookingStatus.CONFIRMED)

class BookingCancelView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingActionSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user not in [booking.requester, booking.provider]:
            raise PermissionDenied("Only requester or provider can cancel.")
        if booking.status in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
            raise ValidationError("Cannot cancel completed or already cancelled bookings.")
        serializer.save(status=BookingStatus.CANCELLED)

class BookingCompleteView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingActionSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.provider:
            raise PermissionDenied("Only provider can complete the session.")
        if booking.status != BookingStatus.CONFIRMED:
            raise ValidationError("Booking must be confirmed before completing.")
        serializer.save(status=BookingStatus.COMPLETED)
