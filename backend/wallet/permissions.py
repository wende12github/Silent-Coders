# from rest_framework import permissions
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class IsSender(permissions.BasePermission):
#     """
#     Custom permission to check if the user is the sender of the transaction.
#     """

#     def has_permission(self, request, view):
#         # The sender must be the logged-in user
#         sender = request.user
#         receiver_id = request.data.get('receiver_id')

#         # Check if the receiver exists
#         try:
#             receiver = User.objects.get(id=receiver_id)
#         except User.DoesNotExist:
#             return False  # If receiver doesn't exist, deny permission

#         # Only allow the sender to initiate the transfer
#         return True
