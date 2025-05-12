from django.shortcuts import render
from leaderboard.services import update_stats_for_service_provider, update_stats_for_service_booker
from wallet.utils import process_booking_confirmation, process_booking_completion, process_booking_cancellation

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from rest_framework.response import Response
from django.db import models
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView, ListAPIView, CreateAPIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model

from .models import AvailabilitySlot, Booking, BookingStatus, Review, Tag
from .serializers import (
    AvailabilitySlotSerializer,
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingStatusUpdateSerializer,
    BookingRescheduleSerializer,
    ReviewSerializer,
    ReviewListSerializer,
    TagSerializer,
)

User = get_user_model()

class BookingCreateView(CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(booked_by=self.request.user)

    @swagger_auto_schema(
        operation_description="Create a new booking.",
        request_body=BookingCreateSerializer,
        responses={201: BookingDetailSerializer(), 400: "Validation error"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class BookingListView(ListAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List all bookings related to the authenticated user (both booked_by and booked_for).",
        responses={200: BookingDetailSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(models.Q(booked_by=user) | models.Q(booked_for=user))

class BookingDetailView(RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve details of a single booking.",
        responses={200: BookingDetailSerializer(), 403: "Forbidden", 404: "Not Found"}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.booked_by != user and obj.booked_for != user:
            raise PermissionDenied("You are not allowed to view this booking.")
        return obj


class BookingStatusUpdateView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    @swagger_auto_schema(
        operation_description="Update the status of a booking (confirm, cancel, complete). Requires appropriate permissions.",
        request_body=BookingStatusUpdateSerializer,
        responses={
            200: BookingDetailSerializer(),
            400: "Validation Error",
            403: "Permission Denied",
            404: "Not Found"
        }
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        booking = self.get_object()
        old_status = booking.status
        new_status = serializer.validated_data.get('status')

        if new_status == BookingStatus.CONFIRMED and old_status == BookingStatus.PENDING:
            process_booking_confirmation(booking)

        elif new_status == BookingStatus.COMPLETED and old_status == BookingStatus.CONFIRMED:
            process_booking_completion(booking)
            update_stats_for_service_provider(booking.booked_for)
            update_stats_for_service_booker(booking.booked_by)

        elif new_status == BookingStatus.CANCELLED and old_status != BookingStatus.CANCELLED:
            process_booking_cancellation(booking)

        serializer.save()


class BookingRescheduleView(UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingRescheduleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    @swagger_auto_schema(
        operation_description="Reschedule a booking (both booked_by and booked_for can reschedule).",
        request_body=BookingRescheduleSerializer,
        responses={200: BookingDetailSerializer(), 403: "Forbidden", 404: "Not Found"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save()


class SubmitReviewView(CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Submit a review for a completed booking. Only the person who booked can review.",
        request_body=ReviewSerializer,
        responses={201: ReviewSerializer(), 400: "Validation error", 403: "Forbidden", 404: "Booking not found"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class ReviewListView(ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewListSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Retrieve a list of reviews. Optionally filter by booking_id or reviewed_user_id.",
        manual_parameters=[
            openapi.Parameter('booking_id', openapi.IN_QUERY, description="Filter by booking ID", type=openapi.TYPE_INTEGER),
            openapi.Parameter('reviewed_user_id', openapi.IN_QUERY, description="Filter by the user who was reviewed (booked_for)", type=openapi.TYPE_INTEGER),
        ],
        responses={200: ReviewListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        booking_id = self.request.query_params.get('booking_id')
        reviewed_user_id = self.request.query_params.get('reviewed_user_id')

        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
        elif reviewed_user_id:
            queryset = queryset.filter(booking__booked_for__id=reviewed_user_id)

        return queryset


class AvailabilitySlotListCreateView(generics.ListCreateAPIView): # Changed back to ListCreateAPIView
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer

    @swagger_auto_schema(
        operation_description="List availability slots for the authenticated user or create a new one.",
        responses={200: AvailabilitySlotSerializer(many=True), 201: AvailabilitySlotSerializer(), 400: "Validation error"}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new availability slot for the authenticated user.",
        request_body=AvailabilitySlotSerializer,
        responses={201: AvailabilitySlotSerializer(), 400: "Validation error"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


    def get_queryset(self):
        return AvailabilitySlot.objects.filter(booked_for=self.request.user)


class AvailabilitySlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer
    queryset = AvailabilitySlot.objects.all()

    @swagger_auto_schema(
        operation_description="Retrieve, update, or delete a specific availability slot.",
        responses={200: AvailabilitySlotSerializer(), 403: "Forbidden", 404: "Not Found"}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a specific availability slot.",
        request_body=AvailabilitySlotSerializer,
        responses={200: AvailabilitySlotSerializer(), 400: "Validation error", 403: "Forbidden", 404: "Not Found"}
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a specific availability slot.",
        request_body=AvailabilitySlotSerializer,
        responses={200: AvailabilitySlotSerializer(), 400: "Validation error", 403: "Forbidden", 404: "Not Found"}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a specific availability slot.",
        responses={204: "No Content", 403: "Forbidden", 404: "Not Found"}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


    def get_object(self):
        obj = super().get_object()
        if obj.booked_for != self.request.user:
             raise PermissionDenied("You do not have permission to modify this slot.")
        return obj


class UserAvailabilityView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AvailabilitySlotSerializer

    @swagger_auto_schema(
        operation_description="List availability slots for a specific user.",
        responses={200: AvailabilitySlotSerializer(many=True), 404: "User not found"}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise NotFound("User not found.")
        return AvailabilitySlot.objects.filter(booked_for=user)


class TagListView(ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="List all available tags.",
        responses={200: TagSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

