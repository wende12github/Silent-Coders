from django.contrib import admin
from .models import Wallet, Transaction

# Register the models with the admin site
admin.site.register(Wallet)
admin.site.register(Transaction)
