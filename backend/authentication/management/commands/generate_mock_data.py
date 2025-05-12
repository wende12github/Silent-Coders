from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import UserSkill, EmailNotificationPreference
from groups.models import Group, GroupMembership, GroupAnnouncement
from chat.models import ChatMessage, PrivateChatMessage
from wallet.models import Wallet, Transaction
from leaderboard.models import UserStats
from notifications.models import Notification
from bookings.models import Booking, Review, AvailabilitySlot
from skills.models import Skill
from random import randint, choice
import random
from faker import Faker

fake = Faker()
User = get_user_model()

SKILLS = ['Python', 'Cooking', 'Writing', 'Django', 'Photography', 'Design', 'Project Management']
LEVELS = ['Beginner', 'Intermediate', 'Expert']

class Command(BaseCommand):
    help = 'Generate mock data for users, skills, bookings, groups, chat messages, notifications, wallets, and transactions'

    def handle(self, *args, **kwargs):
        users = []

        # Create mock users
        for i in range(10):
            email = f"user{randint(1000, 9999)}{i}@example.com"
            username = f"user_{randint(1000, 9999)}{i}"
            if User.objects.filter(username=username).exists():
                continue  

            user = User.objects.create_user(
                username=username,
                email=email,
                password="Test1234",
                bio=fake.paragraph(),
                availability=fake.text(max_nb_chars=40)
            )
            users.append(user)

            # Email notification preferences
            EmailNotificationPreference.objects.create(
                user=user,
                newsletter=choice([True, False]),
                updates=choice([True, False]),
                skill_match_alerts=choice([True, False])
            )

            # User skills
            for _ in range(randint(1, 3)):
                skill_name = choice(SKILLS)
                hours = random.uniform(10, 120)
                skill, created = UserSkill.objects.get_or_create(
                    user=user,
                    skill=skill_name
                )
                skill.experience_hours = hours
                skill.update_level()

            # Wallet
            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet.balance = randint(20, 200)
            wallet.save()

            # Transactions
            for _ in range(randint(2, 5)):
                receiver = choice(users) if users else None
                if receiver and receiver != user:
                    Transaction.objects.create(
                        wallet=wallet,
                        sender=user,
                        receiver=receiver,
                        transaction_type=choice(["debit", "credit"]),
                        amount=round(random.uniform(1.0, 5.0), 2),
                        reason="Mock transaction"
                    )

            # Leaderboard stats
            UserStats.objects.get_or_create(
                user=user,
                defaults={
                    'total_hours_given': round(random.uniform(10, 100), 2),
                    'total_hours_received': round(random.uniform(5, 50), 2),
                    'sessions_completed': randint(1, 10)
                }
            )

        self.stdout.write(self.style.SUCCESS("Created users with wallets, transactions, skills, email prefs, leaderboard stats."))

        # Ensure all skills in SKILLS are created
        for skill_name in SKILLS:
            Skill.objects.get_or_create(name=skill_name)
        self.stdout.write(self.style.SUCCESS("Created mock skills."))

        # Generate mock bookings
        for _ in range(20):
            user = choice(users)
            skill_name = choice(SKILLS)
            skill_instance = Skill.objects.get(name=skill_name)
            other_user = choice(users)
            hours = random.uniform(1, 5)
            availability_slot = AvailabilitySlot.objects.create(
                booked_for=other_user,
                weekday=randint(0, 6),
                start_time=fake.time(),
                end_time=fake.time(),
                is_booked=False
            )
            Booking.objects.create(
                skill=skill_instance,
                booked_by=user,
                booked_for=other_user,
                status=choice(["pending", "confirmed", "completed", "cancelled"]),
                scheduled_time=fake.future_datetime(),
                duration=hours * 60,
                cancel_reason=fake.sentence() if random.choice([True, False]) else None,
                availability=availability_slot
            )

        self.stdout.write(self.style.SUCCESS("Created mock bookings."))

        # Generate groups and chat messages
        for i in range(3):
            owner = random.choice(users)
            group = Group.objects.create(name=f"group_{randint(1000, 9999)}_{i}", owner=owner)
            group_members = random.sample(users, k=3)
            for member in group_members:
                GroupMembership.objects.create(group=group, user=member)

            for _ in range(5):
                sender = random.choice(group_members)
                ChatMessage.objects.create(
                    user=sender,
                    room=group,
                    message=fake.sentence(),
                    message_tyep="text"
                )

            GroupAnnouncement.objects.create(
                group=group,
                title=fake.sentence(),
                message=fake.paragraph(),
                posted_by=owner
            )

            self.stdout.write(self.style.SUCCESS(f"Group '{group.name}' created with members, messages, and announcements."))

        # Generate private chat messages
        for _ in range(20):
            sender = random.choice(users)
            receiver = random.choice([u for u in users if u != sender])
            PrivateChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                message=fake.sentence(),
                message_type="text"
            )

        self.stdout.write(self.style.SUCCESS("Created private chat messages."))

        # Generate notifications
        for user in users:
            for _ in range(randint(1, 5)):
                Notification.objects.create(
                    user=user,
                    type=choice(['booking_request', 'booking_status', 'message', 'review']),
                    content=fake.sentence(),
                    is_read=choice([True, False])
                )

        self.stdout.write(self.style.SUCCESS("Created notifications."))

        self.stdout.write(self.style.SUCCESS("Mock data generation complete!"))