from .models import Wallet, Transaction
from django.core.exceptions import ValidationError

def process_booking_confirmation(booking):
    wallet = Wallet.objects.get(user=booking.requester)
    if not wallet.has_sufficient_balance(booking.duration):
        raise ValidationError("Insufficient balance.")

    wallet.deduct(booking.duration)
    Transaction.objects.create(
        wallet=wallet,
        amount=booking.duration,
        transaction_type='debit',
        reason='Booking confirmed',
        booking=booking
    )

def process_booking_completion(booking):
    wallet = Wallet.objects.get(user=booking.provider)
    wallet.credit(booking.duration)
    Transaction.objects.create(
        wallet=wallet,
        amount=booking.duration,
        transaction_type='credit',
        reason='Booking completed',
        booking=booking
    )