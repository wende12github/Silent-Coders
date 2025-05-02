from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.db import models
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from .models import Booking, BookingStatus
from .serializers import BookingCreateSerializer, BookingActionSerializer, BookingDetailSerializer, BookingRescheduleSerializer
from wallet.utils import process_booking_confirmation, process_booking_completion


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
        
        # Wallet deduction (requester pays at confirmation)
        process_booking_confirmation(booking)
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
        
        # Wallet credit (provider receives points on completion)
        process_booking_completion(booking)

        serializer.save(status=BookingStatus.COMPLETED)
        
        update_user_stats(booking.provider) #Update user stats


class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(models.Q(requester=user) | models.Q(provider=user)).order_by('-scheduled_time')
        serializer = BookingDetailSerializer(bookings, many=True)
        return Response(serializer.data)
    
class BookingDetailView(RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.requester != user and obj.provider != user:
            raise PermissionDenied("You are not allowed to view this booking.")
        return obj
    

class BookingRescheduleView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingRescheduleSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.requester:
            raise PermissionDenied("Only the requester can reschedule the booking.")
        serializer.save()