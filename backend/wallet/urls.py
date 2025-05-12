from django.urls import path
from .views import WalletView, TransactionHistoryView, AdminTransferTimeView # Import AdminTransferTimeView

app_name = 'wallet'

urlpatterns = [
    path('', WalletView.as_view(), name='wallet'),
    path('admin/transfer/', AdminTransferTimeView.as_view(), name='admin-transfer'),
    path('transactions/', TransactionHistoryView.as_view(), name='transaction_history'),
]
