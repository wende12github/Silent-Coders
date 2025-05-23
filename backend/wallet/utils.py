from decimal import Decimal
from .models import Wallet, Transaction
from django.core.exceptions import ValidationError

def process_booking_confirmation(booking):
    wallet = Wallet.objects.get(user=booking.booked_by)
    required_hours = Decimal(str(booking.duration / 60))
    
    print(f"Wallet Balance: {wallet.balance}, Required: {required_hours}")
    
    if not wallet.has_sufficient_balance(required_hours):
        raise ValidationError("Insufficient balance.")

    Transaction.objects.create(
        wallet=wallet,
        amount=required_hours,
        transaction_type="pending",
        reason="Booking confirmed",
        booking=booking
    )

def process_booking_completion(booking):
    booked_by_wallet = Wallet.objects.get(user=booking.booked_by)
    booked_for_wallet = Wallet.objects.get(user=booking.booked_for)
    
    required_hours = Decimal(str(booking.duration / 60))

    booked_by_wallet.deduct(required_hours)

    booked_for_wallet.credit(required_hours)

    Transaction.objects.create(
        wallet=booked_by_wallet,
        amount=required_hours,
        transaction_type="debit",
        reason="Booking completed - Deducted",
        booking=booking
    )

    Transaction.objects.create(
        wallet=booked_for_wallet,
        amount=required_hours,
        transaction_type="credit",
        reason="Booking completed - Credited",
        booking=booking
    )