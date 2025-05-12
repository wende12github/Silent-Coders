from decimal import Decimal
from .models import Wallet, Transaction
from django.core.exceptions import ValidationError
from django.db import transaction as db_transaction
from bookings.models import BookingStatus


def process_booking_confirmation(booking):
    pending_transaction, created = Transaction.objects.get_or_create(
        booking=booking,
        transaction_type="pending",
        defaults={
            "wallet": Wallet.objects.get(user=booking.booked_by),
            "sender": booking.booked_by,
            "receiver": booking.booked_for,
            "amount": Decimal(str(booking.duration / 60)),
            "reason": f"Booking {booking.id} - Pending deduction for {booking.skill.name}",
        },
    )

    if not created and pending_transaction.transaction_type != "pending":
        print(
            f"Warning: Found non-pending transaction for booking {booking.id} during confirmation."
        )

    wallet = Wallet.objects.get(user=booking.booked_by)
    required_hours = Decimal(str(booking.duration / 60))

    if not wallet.has_sufficient_balance(required_hours):
        raise ValidationError("Insufficient balance.")


def process_booking_completion(booking):
    try:
        pending_transaction = Transaction.objects.get(
            booking=booking, transaction_type="pending"
        )
    except Transaction.DoesNotExist:
        print(
            f"Error: No pending transaction found for completed booking {booking.id}."
        )

        return

    booked_by_wallet = Wallet.objects.get(user=booking.booked_by)
    booked_for_wallet = Wallet.objects.get(user=booking.booked_for)

    transfer_amount = pending_transaction.amount

    with db_transaction.atomic():
        booked_by_wallet.refresh_from_db()
        booked_for_wallet.refresh_from_db()

        booked_by_wallet.deduct(transfer_amount)
        booked_for_wallet.credit(transfer_amount)

        pending_transaction.wallet = booked_by_wallet
        pending_transaction.transaction_type = "debit"
        pending_transaction.reason = (
            f"Booking {booking.id} - Deduction on completion for {booking.skill.name}"
        )
        pending_transaction.save()

        Transaction.objects.create(
            wallet=booked_for_wallet,
            sender=booking.booked_by,
            receiver=booking.booked_for,
            transaction_type="credit",
            amount=transfer_amount,
            reason=f"Booking {booking.id} - Credit on completion for {booking.skill.name}",
            booking=booking,
        )


def process_booking_cancellation(booking):
    try:
        pending_transaction = Transaction.objects.get(
            booking=booking, transaction_type="pending"
        )

        pending_transaction.delete()
        print(f"Pending transaction for booking {booking.id} deleted on cancellation.")

    except Transaction.DoesNotExist:
        print(
            f"No pending transaction found for booking {booking.id} during cancellation."
        )
        pass
