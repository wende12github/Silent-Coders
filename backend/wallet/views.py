from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction as db_transaction
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import Wallet, Transaction
from .serializers import (
    WalletSerializer,
    TransactionSerializer,
    AdminTransferSerializer,
)
from django.conf import settings
from django.core.mail import send_mail
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve the authenticated user's wallet balance.",
        responses={200: WalletSerializer()},
    )
    def get(self, request):
        try:
            wallet = Wallet.objects.get(user=request.user)
            serializer = WalletSerializer(wallet)
            return Response(serializer.data)
        except Wallet.DoesNotExist:
            return Response(
                {"error": "Wallet not found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )


class AdminTransferTimeView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Transfer time (currency) from admin to another user manually.",
        request_body=AdminTransferSerializer,
        responses={
            200: openapi.Response(description="Transfer successful"),
            400: openapi.Response(description="Invalid input or insufficient balance"),
            404: openapi.Response(description="Receiver not found"),
            500: openapi.Response(description="Transaction failed"),
        },
    )
    def post(self, request):
        serializer = AdminTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        receiver_id = serializer.validated_data["receiver_id"]
        amount = serializer.validated_data["amount"]
        reason = serializer.validated_data.get("reason", "")

        sender = request.user

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if sender == receiver:
            return Response(
                {"error": "Cannot transfer time to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with db_transaction.atomic():
                sender_wallet = Wallet.objects.select_for_update().get(user=sender)
                receiver_wallet = Wallet.objects.select_for_update().get(user=receiver)

                if not sender_wallet.has_sufficient_balance(amount):
                    return Response(
                        {"error": "Admin has insufficient balance."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                sender_wallet.deduct(amount)
                receiver_wallet.credit(amount)

                Transaction.objects.create(
                    wallet=sender_wallet,
                    sender=sender,
                    receiver=receiver,
                    transaction_type="debit",
                    amount=amount,
                    reason=reason,
                )
                Transaction.objects.create(
                    wallet=receiver_wallet,
                    sender=sender,
                    receiver=receiver,
                    transaction_type="credit",
                    amount=amount,
                    reason=reason,
                )

        except Wallet.DoesNotExist:
            return Response(
                {"error": "Sender or receiver wallet not found."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {"error": "Transaction failed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": f"Successfully transferred {amount} hours to {receiver.username}."
            },
            status=status.HTTP_200_OK,
        )


class TransactionHistoryView(ListAPIView):
    queryset = Transaction.objects.all().order_by("-created_at")
    serializer_class = TransactionSerializer
    pagination_class = TransactionPagination
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get list of transactions for the authenticated user with optional filters for 'earned' or 'spent'.",
        manual_parameters=[
            openapi.Parameter(
                "type",
                openapi.IN_QUERY,
                description="Filter by type: 'earned' (credit) or 'spent' (debit)",
                type=openapi.TYPE_STRING,
                enum=["earned", "spent"],
            )
        ],
        responses={200: TransactionSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user

        queryset = Transaction.objects.filter(wallet__user=user).order_by("-created_at")

        filter_type = self.request.query_params.get("type", None)
        if filter_type == "earned":
            queryset = queryset.filter(transaction_type="credit")
        elif filter_type == "spent":
            queryset = queryset.filter(transaction_type="debit")

        return queryset
