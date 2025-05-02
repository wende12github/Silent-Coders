from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)  # Balance in hours

    def has_sufficient_balance(self, amount):
        return self.balance >= amount

    def deduct(self, amount):
        self.balance -= amount
        self.save()

    def credit(self, amount):
        self.balance += amount
        self.save()

    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}h"


class Transaction(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_transactions')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='received_transactions')
    transaction_type = models.CharField(max_length=10, choices=[('debit', 'Debit'), ('credit', 'Credit')], default='debit')
    amount = models.DecimalField(max_digits=5, decimal_places=2)  # Amount in hours
    reason = models.CharField(max_length=255, blank=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction from {self.sender.username} to {self.receiver.username} : {self.amount}hr"
