from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.db import models
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Booking, BookingStatus
from .serializers import BookingCreateSerializer, BookingActionSerializer, BookingDetailSerializer, BookingRescheduleSerializer


class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

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
        return Booking.objects.filter(models.Q(requester=user) | models.Q(provider=user))


class BookingConfirmView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingActionSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Confirm a pending booking (provider only).",
        responses={200: BookingActionSerializer(), 403: "Forbidden", 400: "Invalid booking state"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

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

    @swagger_auto_schema(
        operation_description="Cancel a booking (requester or provider).",
        responses={200: BookingActionSerializer(), 400: "Invalid booking state", 403: "Forbidden"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

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

    @swagger_auto_schema(
        operation_description="Complete a booking (provider only).",
        responses={200: BookingActionSerializer(), 400: "Invalid booking state", 403: "Forbidden"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.provider:
            raise PermissionDenied("Only provider can complete the session.")
        if booking.status != BookingStatus.CONFIRMED:
            raise ValidationError("Booking must be confirmed before completing.")
        serializer.save(status=BookingStatus.COMPLETED)
        
        update_user_stats(booking.provider) #Update user stats



class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get all bookings where the user is requester or provider.",
        responses={200: BookingDetailSerializer(many=True)}
    )
    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(models.Q(requester=user) | models.Q(provider=user)).order_by('-scheduled_time')
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
        if obj.requester != user and obj.provider != user:
            raise PermissionDenied("You are not allowed to view this booking.")
        return obj


class BookingRescheduleView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingRescheduleSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Reschedule a booking (only requester can reschedule).",
        responses={200: BookingRescheduleSerializer(), 403: "Forbidden"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        booking = self.get_object()
        if self.request.user != booking.requester:
            raise PermissionDenied("Only the requester can reschedule the booking.")
        serializer.save()
