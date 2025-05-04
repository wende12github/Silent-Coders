from django.shortcuts import render
from leaderboard.services import update_user_stats
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.db import models
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import AvailabilitySlot, Booking, BookingStatus, Review
from .serializers import AvailabilitySlotSerializer, BookingCancelSerializer, BookingCreateSerializer, BookingActionSerializer, BookingDetailSerializer, BookingRescheduleSerializer, BookingStatusOnlySerializer, ReviewSerializer
from wallet.utils import process_booking_confirmation, process_booking_completion


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(booked_by=self.request.user)
    
    @swagger_auto_schema(
        operation_description="Create a new booking.",
        responses={201: BookingCreateSerializer(), 400: "Validation error"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class BookingListView(generics.ListAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List all bookings related to the authenticated user.",
        responses={200: BookingCreateSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(models.Q(booked_by=user) | models.Q(booked_for=user))


class BookingConfirmView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingStatusOnlySerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.booked_for:
            raise PermissionDenied("Only booked_for can confirm the booking.")
        if booking.status != BookingStatus.PENDING:
            raise ValidationError("Booking must be pending to confirm.")

        process_booking_confirmation(booking)
        serializer.save(status=BookingStatus.CONFIRMED)
        
        # Wallet deduction (booked_by pays at confirmation)
        process_booking_confirmation(booking)
        serializer.save(status=BookingStatus.CONFIRMED)


class BookingCancelView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCancelSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user not in [booking.booked_by, booking.booked_for]:
            raise PermissionDenied("Only booked_by or booked_for can cancel.")
        if booking.status in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
            raise ValidationError("Cannot cancel completed or already cancelled bookings.")

        serializer.save(status=BookingStatus.CANCELLED)



class BookingCompleteView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingStatusOnlySerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.booked_for:
            raise PermissionDenied("Only booked_for can complete the session.")
        if booking.status != BookingStatus.CONFIRMED:
            raise ValidationError("Booking must be confirmed before completing.")

        process_booking_completion(booking)
        serializer.save(status=BookingStatus.COMPLETED)
        update_user_stats(booking.booked_for)#Update user stats



class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get all bookings where the user is booked_by or booked_for.",
        responses={200: BookingDetailSerializer(many=True)}
    )
    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(models.Q(booked_by=user) | models.Q(booked_for=user)).order_by('-scheduled_time')
        serializer = BookingDetailSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingDetailView(RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve details of a single booking.",
        responses={200: BookingDetailSerializer(), 403: "Forbidden"}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.booked_by != user and obj.booked_for != user:
            raise PermissionDenied("You are not allowed to view this booking.")
        return obj


class BookingRescheduleView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingRescheduleSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Reschedule a booking (only booked_by can reschedule).",
        responses={200: BookingRescheduleSerializer(), 403: "Forbidden"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.booked_by:
            raise PermissionDenied("Only the booked_by can reschedule the booking.")
        serializer.save()


class SubmitReviewView(generics.CreateAPIView):
    queryset = Review.objects.all() 
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        booking_id = self.kwargs.get('pk')
        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            raise ValidationError("Booking not found.")

        if booking.user != self.request.user:
            raise ValidationError("You can only review your own bookings.")

        if booking.status != 'completed':
            raise ValidationError("You can only review completed bookings.")

        if hasattr(booking, 'review'):
            raise ValidationError("This booking already has a review.")

        serializer.save(reviewer=self.request.user, booking=booking)

class AvailabilitySlotListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(booked_for=self.request.user)
