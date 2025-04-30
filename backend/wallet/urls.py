from django.urls import path
from .views import WalletView, TransferTimeView, TransactionHistoryView

app_name = 'wallet'

urlpatterns = [
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('transfer/', TransferTimeView.as_view(), name='transfer_time'),
    path('transactions/', TransactionHistoryView.as_view(), name='transaction_history'),
]
