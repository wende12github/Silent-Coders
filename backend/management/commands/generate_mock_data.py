from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.skills.models import Skill
from faker import Faker
import random

from groups.models import Group, GroupMembership, UserStats
from chat.models import ChatMessage, PrivateChatMessage
from wallet.models import Wallet, Transaction
from authentication.models import User, UserSkill

fake = Faker()
User = get_user_model()

class Command(BaseCommand):
    help = "Generate mock data for users, skills, group chats, private messages, wallets, and leaderboard"

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating mock users...")

        users = []
        for _ in range(10):
            user = User.objects.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password="Password1234",
                first_name=fake.first_name(),
                last_name=fake.last_name()
            )
            users.append(user)

            # Create a wallet with random time credits
            Wallet.objects.create(user=user, balance=random.randint(10, 100))

            Skill.objects.create(user=user, name=choice(["Python", "Design", "Music", "Cooking"]))

            # Create user stats for leaderboard
            UserStats.objects.create(
                user=user,
                sessions_attended=random.randint(1, 20),
                sessions_hosted=random.randint(1, 10),
                total_time_spent=random.randint(100, 1000)
            )

        self.stdout.write("Creating a test group and memberships...")

        group = Group.objects.create(name="group_testing")
        for user in users:
            GroupMembership.objects.create(group=group, user=user)

        self.stdout.write("Creating group chat messages...")

        for _ in range(50):
            ChatMessage.objects.create(
                user=random.choice(users),
                room=group,
                message=fake.sentence(),
                message_tyep="text"
            )

        self.stdout.write("Creating private messages...")

        for _ in range(30):
            sender, receiver = random.sample(users, 2)
            PrivateChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                message=fake.sentence(),
                message_type="text"
            )
        
        # Random Transactions
        for _ in range(randint(2, 5)):
            amount = randint(5, 30)
            Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                transaction_type=choice(["earn", "spend"]),
                description="Mock transaction"
            )

        self.stdout.write(self.style.SUCCESS("Mock data created successfully."))
