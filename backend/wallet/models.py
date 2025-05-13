from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.utils.timezone import now

User = settings.AUTH_USER_MODEL

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)

    def has_sufficient_balance(self, amount):
        # Ensure amount is Decimal for comparison
        amount = Decimal(str(amount))
        return self.balance >= amount


    def deduct(self, amount):
        amount = Decimal(str(amount))
        # Ensure amount is positive for deduction logic
        if amount < 0:
            raise ValueError("Deduction amount must be positive.")
        self.balance -= amount
        self.save()

    def credit(self, amount):
        amount = Decimal(str(amount))
         # Ensure amount is positive for crediting logic
        if amount < 0:
            raise ValueError("Credit amount must be positive.")
        self.balance += amount
        self.save()

    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}h"


class Transaction(models.Model):
    # Corrected transaction types for clarity: Debit (money going out), Credit (money coming in)
    # Pending state is better managed on the Booking object or a separate status field if needed
    TRANSACTION_TYPES = [
        ('debit', 'Debit'),
        ('credit', 'Credit'),
        # Removed 'pending' as a transaction type.
        # The pending state of a booking transaction is managed via the Booking model and the single 'pending' transaction record.
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    # Sender and Receiver are optional as some transactions might not have both (e.g., initial credit)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_transactions')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES) # Removed default='debit'
    # Increased max_digits for amount to allow larger transactions
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]) # Amount should always be positive, type indicates debit/credit
    reason = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='completed')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # Default ordering

    def __str__(self):
        # Safely access sender and receiver usernames
        sender_username = self.sender.username if self.sender else 'N/A'
        receiver_username = self.receiver.username if self.receiver else 'N/A'
        return f"ID: {self.id} | Type: {self.transaction_type} | Amount: {self.amount}h | From: {sender_username} | To: {receiver_username}"

