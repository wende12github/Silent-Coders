from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import Wallet, Transaction
from .serializers import WalletSerializer, TransactionSerializer
from .permissions import IsSender
from django.conf import settings
from django.core.mail import send_mail

User = settings.AUTH_USER_MODEL

# Pagination for transaction history
class TransactionPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

# Wallet View to show the user's wallet balance
class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet = Wallet.objects.get(user=request.user)
        serializers = WalletSerializer(wallet)
        return Response(serializers.data)

# Transfer Time View (making the tansaction Manually)
class AdminTransferTimeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get('receiver_id')
        amount = request.data.get('amount')
        reason = request.data.get('reason', '')

        # Get receiver
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)


        # Transaction is wrapped in atomic to ensure consistency
        try:
            with transaction.atomic():
                 # Lock sender and receiver wallets for update
                sender_wallet = Wallet.objects.select_for_update().get(user=sender)
                receiver_wallet = Wallet.objects.select_for_update().get(user=receiver)
                
                amount = float(amount)
                if not sender_wallet.has_sufficient_balance(amount):
                    return Response({"error": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

                # Udate the Wallet balances and Perform the transfer
                sender_wallet.deduct(amount)
                receiver_wallet.credit(amount)

                # Create a new transaction record
                Transaction.objects.create(wallet=sender_wallet, amount=amount, transaction_type='debit', reason=reason, sender=sender, receiver=receiver)
                Transaction.objects.create(wallet=receiver_wallet, amount=amount, transaction_type='credit', reason=reason, sender=sender, receiver=receiver)

        except Exception as e:
            return Response({"error": "Transaction failed.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Time transferred successfully."}, status=status.HTTP_200_OK)

# Transaction History View (with pagination and filters)
class TransactionHistoryView(ListAPIView):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    pagination_class = TransactionPagination

    def get_queryset(self):
        filter_type = self.request.query_params.get('type', None)
        if filter_type == 'earned':
            return Transaction.objects.filter(amount__gt=0)
        elif filter_type == 'spent':
            return Transaction.objects.filter(amount__lt=0)
        return Transaction.objects.all()
