from django.apps import AppConfig

class WalletConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'wallet'

    def ready(self):
        try:
            import wallet.signals  # Make sure the signals module exists in your app.
        except ImportError:
            pass  # Optionally, log this if you need to debug when signals module is not found.
