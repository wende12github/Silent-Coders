from django.contrib import admin
from .models import Wallet, Transaction

# Register the models with the admin site
admin.site.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')

admin.site.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'transaction_type', 'amount', 'status', 'timestamp', 'reference_id')
    search_fields = ('wallet__user__username', 'reference_id')
    list_filter = ('transaction_type', 'status', 'timestamp')
