import pytest
from django.urls import reverse
from wallet.models import Wallet, Transaction
from rest_framework.test import APIClient

@pytest.fixture
def create_users(django_user_model):
    user1 = django_user_model.objects.create_user(username='user1', password='password123')
    user2 = django_user_model.objects.create_user(username='user2', password='password123')
    return user1, user2

@pytest.fixture
def create_wallets(create_users):
    user1, user2 = create_users
    wallet1, _ = Wallet.objects.get_or_create(user=user1)
    wallet2, _ = Wallet.objects.get_or_create(user=user2)
    return wallet1, wallet2

@pytest.fixture
def api_client_authenticated(create_users):
    user1, _ = create_users
    client = APIClient()
    client.force_authenticate(user=user1)
    return client
# @pytest.fixture
# def api_client_authenticated(client, create_users):
#     user1, _ = create_users
#     client.login(username='user1', password='password123')
#     return client

# @pytest.mark.django_db
# def test_wallet_balance_view(api_client_authenticated, create_wallets):
#     url = reverse('wallet:wallet')  # or '/api/wallet/wallet/' directly
#     response = api_client_authenticated.get(url)

#     assert response.status_code == 200
#     assert 'balance' in response.data
#     assert float(response.data['balance']) == 10

# @pytest.mark.django_db
# def test_transaction_history(api_client_authenticated, create_wallets, create_users):
#     user1, user2 = create_users
#     Transaction.objects.create(sender=user1, receiver=user2, amount=5, reason='Helped with homework')

#     url = reverse('wallet:transaction_history')
#     response = api_client_authenticated.get(url)

#     assert response.status_code == 200
#     assert len(response.data) >= 1

@pytest.mark.django_db
def test_transfer_time_success(api_client_authenticated, create_wallets):
    url = reverse('wallet:transfer_time')
    data = {
        'receiver_id': 'user2',
        'amount': 10,
        'reason': 'Tutoring'
    }
    response = api_client_authenticated.post(url, data)

    assert response.status_code == 201

    wallet1, wallet2 = create_wallets
    wallet1.refresh_from_db()
    wallet2.refresh_from_db()
    assert wallet1.balance == 40
    assert wallet2.balance == 30

# @pytest.mark.django_db
# def test_transfer_time_insufficient_balance(api_client_authenticated):
#     url = reverse('wallet:transfer_time')
#     data = {
#         'receiver_id': 'user2',
#         'amount': 1000,  # too much
#         'reason': 'Big Gift'
#     }
#     response = api_client_authenticated.post(url, data)

#     assert response.status_code == 400
#     assert 'error' in response.data

# @pytest.mark.django_db
# def test_transfer_to_nonexistent_user(api_client_authenticated):
#     url = reverse('wallet:transfer_time')
#     data = {
#         'receiver_id': 'nonexistent_user',
#         'amount': 5,
#         'reason': 'Testing'
#     }
#     response = api_client_authenticated.post(url, data)

#     assert response.status_code == 400
#     assert 'error' in response.data
