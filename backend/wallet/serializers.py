from decimal import Decimal
from bookings.serializers import UserSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Wallet, Transaction
from django.core.validators import MinValueValidator

User = get_user_model()


class WalletSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "user", "balance"]


class TransactionSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Transaction

        fields = [
            "id",
            "sender",
            "receiver",
            "transaction_type",
            "amount",
            "reason",
            "booking",
            "created_at",
        ]
        read_only_fields = fields


class AdminTransferSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)
