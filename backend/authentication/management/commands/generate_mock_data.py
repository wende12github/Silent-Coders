from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import UserSkill, EmailNotificationPreference
from groups.models import Group
from chat.models import ChatMessage
from wallet.models import Wallet, Transaction
from leaderboard.models import UserStats
from random import randint, choice
import random
from faker import Faker

fake = Faker()
User = get_user_model()

SKILLS = ['Python', 'Cooking', 'Writing', 'Django', 'Photography', 'Design', 'Project Management']
LEVELS = ['Beginner', 'Intermediate', 'Expert']

class Command(BaseCommand):
    help = 'Generate mock users, skills, email prefs, wallets, transactions, leaderboards, groups, and messages'

    def handle(self, *args, **kwargs):
        users = []

        uniqname = random.randint(1000, 9999)  # To be Ensure username/email uniqueness

        for i in range(10):
            email = f"user{uniqname}{i}@example.com"
            username = f"user_{uniqname}{i}"
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

            EmailNotificationPreference.objects.create(
                user=user,
                newsletter=choice([True, False]),
                updates=choice([True, False]),
                skill_match_alerts=choice([True, False])
            )

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

            # Transactions data generate
            for _ in range(randint(2, 5)):
                receiver = choice(users) if users else None
                if receiver and receiver != user:
                    Transaction.objects.create(
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

        # Groups and Chat
        for i in range(3):
            owner = random.choice(users)
            group = Group.objects.create(name=f"group_{uniqname}_{i}", owner=owner)
            group_members = random.sample(users, k=3)
            for member in group_members:
                group.members.add(member)

            for _ in range(5):
                sender = random.choice(group_members)
                ChatMessage.objects.create(
                    user=sender,
                    room=group,
                    message=fake.sentence(),
                    message_tyep="text"
                )

            self.stdout.write(self.style.SUCCESS(f"Group '{group.name}' created with members and messages."))

        # Leaderboards
        self.stdout.write(self.style.MIGRATE_HEADING("\nLeaderboards"))

        top_wallets = Wallet.objects.select_related('user').order_by('-balance')[:5]
        self.stdout.write(self.style.SUCCESS("Top Wallet Balances:"))
        for w in top_wallets:
            self.stdout.write(f"{w.user.username}: {w.balance} credits")

        top_skills = {}
        for skill in UserSkill.objects.select_related('user'):
            top_skills.setdefault(skill.user.username, 0)
            top_skills[skill.user.username] += skill.experience_hours

        sorted_skills = sorted(top_skills.items(), key=lambda x: x[1], reverse=True)[:5]
        self.stdout.write(self.style.SUCCESS("🎓 Top Skill Hours:"))
        for username, hours in sorted_skills:
            self.stdout.write(f"{username}: {round(hours, 1)} hrs")

        top_stats = UserStats.objects.select_related('user').order_by('-total_hours_given')[:5]
        self.stdout.write(self.style.SUCCESS("Top Contributors (hours given):"))
        for stat in top_stats:
            self.stdout.write(f"{stat.user.username}: {stat.total_hours_given}h given, {stat.sessions_completed} sessions")

        self.stdout.write(self.style.SUCCESS("Mock data generation complete!"))
