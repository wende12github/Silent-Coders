import os
import django
import random
from datetime import timedelta, datetime
from decimal import Decimal

# Set up Django environment
# Replace 'your_project_name.settings' with your actual settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timebank.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from faker import Faker

# Import your models
from authentication.models import EmailNotificationPreference
from bookings.models import Tag, AvailabilitySlot, Booking, Review
from groups.models import Group, GroupMembership, UserStats as GroupUserStats, GroupAnnouncement
from leaderboard.models import UserStats as LeaderboardUserStats
from message.models import ChatMessage, PrivateChatMessage
from skills.models import Skill, LOCATION_CHOICES
from wallet.models import Wallet, Transaction
from bookings.constants import BookingStatus # Assuming you have this constants file
from users.models import User, AvailabilityChoices
# Import the SkillSerializer from users.serializers
from users.serializers import SkillSerializer


User = get_user_model()
fake = Faker()

# --- Configuration ---
NUM_USERS = 20
NUM_TAGS = 15
NUM_SKILLS_PER_USER = 3 # Max number of skills per user
NUM_AVAILABILITY_SLOTS_PER_USER = 5 # Max number of slots per user
NUM_GROUPS = 10
MAX_MEMBERS_PER_GROUP = 10
NUM_ANNOUNCEMENTS_PER_GROUP = 3
NUM_BOOKINGS = 50
NUM_REVIEWS = 30 # Should be less than or equal to NUM_BOOKINGS
NUM_CHAT_MESSAGES_PER_GROUP = 20
NUM_PRIVATE_MESSAGES = 40
INITIAL_WALLET_BALANCE = Decimal('10.00')
MAX_TAGS_PER_SKILL = 5 # Maximum number of tags to assign to a single skill


# Predefined lists for generating mock data
# Expanded list of potential tag names
POTENTIAL_TAG_NAMES = [
    "Programming", "Web Development", "Mobile Development", "Data Science",
    "Machine Learning", "AI", "Design", "Graphic Design", "UI/UX",
    "Video Editing", "Photography", "Writing", "Technical Writing", "Content Creation",
    "Marketing", "Social Media", "SEO", "Email Marketing", "Sales",
    "Business", "Finance", "Accounting", "Investing", "Economics",
    "Languages", "Spanish", "French", "German", "Mandarin",
    "Tutoring", "Math", "Physics", "Chemistry", "Biology", "History", "Literature",
    "Music", "Guitar", "Piano", "Singing", "Theory", "Production",
    "Art", "Drawing", "Painting", "Sculpting", "Digital Art",
    "Cooking", "Baking", "Cuisine", "Nutrition",
    "Fitness", "Yoga", "Meditation", "Wellness", "Sports",
    "Technology", "Cybersecurity", "Cloud Computing", "Networking", "Databases",
    "Project Management", "Agile", "Scrum", "Kanban",
    "Communication", "Public Speaking", "Presentation", "Negotiation",
    "Crafts", "Knitting", "Crocheting", "Sewing", "Woodworking",
    "Gardening", "Home Improvement", "Repair", "Automotive",
    "Education", "Coaching", "Mentoring", "Study Skills",
    "Legal", "Research", "Writing",
    "Healthcare", "First Aid", "Medical Terminology",
    "Gaming", "Strategy", "Design", "Development",
    "Blockchain", "Crypto", "NFTs", "DeFi",
    "Creative Writing", "Poetry", "Fiction", "Nonfiction",
    "Editing", "Proofreading", "Copyediting",
    "Translation", "Interpretation",
    "Customer Service", "Support", "Experience",
    "Leadership", "Teamwork", "Collaboration",
    "Public Relations", "Journalism", "Blogging",
    "Data Analysis", "Visualization", "Statistics",
    "Environmental", "Sustainability", "Conservation",
    "Philosophy", "Psychology", "Sociology", "Anthropology",
    "Volunteering", "Community", "Nonprofit", "Fundraising",
    "Event Planning", "Coordination",
    "Architecture", "Interior Design", "Landscape Design",
    "Fashion", "Textiles", "Jewelry",
    "Film", "Theater", "Acting", "Directing", "Screenwriting",
    "Dance", "Choreography", "Movement",
    "Photography", "Videography", "Editing",
]


# --- Helper Functions ---

def create_users(num_users):
    """Creates mock users."""
    print(f"Creating {num_users} users...")
    users = []
    for i in range(num_users):
        username = fake.user_name() + str(i) # Ensure unique username
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        # Check if user already exists (handle potential unique constraint issues)
        if User.objects.filter(email=email).exists() or User.objects.filter(username=username).exists():
            continue

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='password123', # Set a default password for mock users
            bio=fake.paragraph(nb_sentences=3),
            # Corrected: Access choices from User.AvailabilityChoices
            availability=random.choice([choice[0] for choice in AvailabilityChoices.choices]), # Access choices correctly
        )
        users.append(user)
        print(f"  Created user: {user.username}")
    return users

def create_email_preferences(users):
    """Creates email notification preferences for users."""
    print("Creating email notification preferences...")
    preferences = []
    for user in users:
        pref, created = EmailNotificationPreference.objects.get_or_create(user=user)
        pref.newsletter = fake.boolean()
        pref.updates = fake.boolean()
        pref.skill_match_alerts = fake.boolean()
        pref.save()
        preferences.append(pref)
        print(f"  Created preferences for {user.username}")
    return preferences

def create_tags(num_tags):
    """Creates mock tags."""
    print(f"Creating {num_tags} tags...")
    tags = []
    for _ in range(num_tags):
        name = fake.word().lower()
        # Ensure unique tag name
        if not Tag.objects.filter(name=name).exists():
            tag = Tag.objects.create(name=name)
            tags.append(tag)
            print(f"  Created tag: {tag.name}")
    return tags

def create_skills(users, tags, num_skills_per_user):
    """Creates mock skills for users using the SkillSerializer."""
    print("Creating skills for users...")
    skills = []
    for user in users:
        num_skills = random.randint(1, num_skills_per_user)
        # Get a pool of tags for this user's skills
        user_tags_pool = random.sample(tags, min(num_skills * 3, len(tags))) # Get more tags than skills

        for _ in range(num_skills):
            skill_name = fake.catch_phrase().split(' ')[0].capitalize() # Get a single word skill name
            # Ensure skill name is somewhat unique per user
            # This check is basic; a real app might need more robust uniqueness or handling
            if Skill.objects.filter(user=user, name=skill_name).exists():
                continue # Skip if skill name already exists for this user

            description = fake.sentence()
            is_offered = fake.boolean(chance_of_getting_true=75) # Most skills are offered
            location = random.choice([choice[0] for choice in LOCATION_CHOICES])
            address = fake.address() if location == 'local' and random.random() > 0.3 else None # Optional address for local
            is_visible = fake.boolean(chance_of_getting_true=80) # Most skills are visible

            # Generate a random list of tag names from the user's pool
            num_tags = random.randint(0, min(MAX_TAGS_PER_SKILL, len(user_tags_pool)))
            # Get tag objects from the pool and extract their names
            skill_tag_objects = random.sample(user_tags_pool, num_tags)
            skill_tag_names = [tag.name for tag in skill_tag_objects] # Get list of tag names

            # Prepare data for the serializer
            skill_data = {
                'name': skill_name,
                'description': description,
                'is_offered': is_offered,
                'location': location,
                'address': address,
                'tags': skill_tag_names, # Pass the list of tag names
                'is_visible': is_visible,
                # level, endorsements, experience_hours are read-only and set by backend logic
                # user is set via serializer.save()
            }

            # Instantiate the serializer with the data
            serializer = SkillSerializer(data=skill_data)

            try:
                # Validate the data
                serializer.is_valid(raise_exception=True)

                # Save the skill instance, passing the owner user
                # The serializer's create method handles the tags get_or_create and assignment
                skill_instance = serializer.save(user=user) # Pass the user instance here

                skills.append(skill_instance)
                print(f"  Created skill '{skill_instance.name}' for user '{user.username}' with tags: {skill_tag_names}")

            except Exception as e:
                print(f"Error creating skill: {skill_name} for user {user.username}. Error: {e}")
                # Print validation errors if available
                if hasattr(serializer, 'errors'):
                    print(f"Validation Errors: {serializer.errors}")

    return skills

def create_availability_slots(users, num_slots_per_user):
    """Creates mock availability slots for users."""
    print("Creating availability slots...")
    availability_slots = []
    for user in users:
        num_slots = random.randint(1, num_slots_per_user)
        for _ in range(num_slots):
            weekday = random.randint(0, 6)
            # Generate a random time between 8 AM and 8 PM
            hour = random.randint(8, 20)
            minute = random.choice([0, 15, 30, 45])
            start_time = datetime.strptime(f"{hour:02d}:{minute:02d}", "%H:%M").time()

            # Ensure end time is after start time (at least 30 mins, max 4 hours later)
            start_datetime = datetime.combine(datetime.today(), start_time)
            end_datetime = start_datetime + timedelta(minutes=random.choice([30, 60, 90, 120, 180, 240]))
            end_time = end_datetime.time()

            # Ensure unique together constraint (user, weekday, start_time, end_time)
            if not AvailabilitySlot.objects.filter(
                booked_for=user,
                weekday=weekday,
                start_time=start_time,
                end_time=end_time
            ).exists():
                slot = AvailabilitySlot.objects.create(
                    booked_for=user,
                    weekday=weekday,
                    start_time=start_time,
                    end_time=end_time,
                    # is_booked is False by default
                )
                availability_slots.append(slot)
                # print(f"  Created slot for {user.username} on {slot.get_weekday_display()} at {slot.start_time}") # Too verbose
    return availability_slots

def create_groups(users, num_groups):
    """Creates mock groups."""
    print(f"Creating {num_groups} groups...")
    groups = []
    # Ensure there are enough users to be owners
    if len(users) < num_groups:
        print("Warning: Not enough users to create all groups. Creating fewer groups.")
        num_groups = len(users)

    # Ensure unique owners for each group if num_groups <= len(users)
    owners = random.sample(users, num_groups) if num_groups <= len(users) else users * (num_groups // len(users)) + random.sample(users, num_groups % len(users))


    for i in range(num_groups):
        group_name = fake.unique.company() + " Group" # Ensure unique name
        # The unique constraint on name in the model/db should handle this,
        # but checking here reduces attempts on duplicates.
        if Group.objects.filter(name=group_name).exists():
             continue

        group = Group.objects.create(
            name=group_name,
            description=fake.paragraph(nb_sentences=5),
            owner=owners[i % len(owners)], # Cycle through owners if more groups than users
            # image field is optional, can add logic to generate/assign images if needed
        )
        groups.append(group)
        print(f"  Created group: {group.name} owned by {group.owner.username}")
    return groups

def add_group_members(groups, users, max_members_per_group):
    """Adds users as members to groups."""
    print("Adding members to groups...")
    memberships = []
    for group in groups:
        # Ensure owner is a member
        membership, created = GroupMembership.objects.get_or_create(user=group.owner, group=group)
        if created:
             memberships.append(membership)
             # print(f"  Added {group.owner.username} to {group.name} (owner)") # Too verbose

        # Add other random members
        potential_members = [user for user in users if user != group.owner]
        # Ensure we don't try to add more members than available or max_members_per_group
        num_members_to_add = random.randint(1, min(max_members_per_group, len(potential_members)))
        selected_members = random.sample(potential_members, num_members_to_add)

        for member in selected_members:
            # Ensure unique together constraint (user, group)
            membership, created = GroupMembership.objects.get_or_create(user=member, group=group)
            if created:
                memberships.append(membership)
                # print(f"  Added {member.username} to {group.name}") # Too verbose
    return memberships

def create_group_user_stats(groups):
    """Creates initial user stats for group members."""
    print("Creating group user stats...")
    group_stats = []
    for group in groups:
        # Iterate through existing members
        for member in group.members.all():
            # Ensure unique together constraint (user, group)
            stats, created = GroupUserStats.objects.get_or_create(user=member, group=group)
            if created:
                 stats.total_hours_given = fake.random_int(min=0, max=50)
                 stats.total_hours_received = fake.random_int(min=0, max=50)
                 stats.sessions_completed = fake.random_int(min=0, max=20)
                 stats.save()
                 group_stats.append(stats)
                 # print(f"  Created stats for {member.username} in {group.name}") # Too verbose
    return group_stats

def create_group_announcements(groups, num_announcements_per_group):
    """Creates mock announcements for groups."""
    print("Creating group announcements...")
    announcements = []
    for group in groups:
        num_announcements = random.randint(0, num_announcements_per_group)
        # Ensure there are members to post announcements
        members = list(group.members.all()) # Convert to list to use random.choice
        if not members:
            continue

        for _ in range(num_announcements):
            poster = random.choice(members)
            announcement = GroupAnnouncement.objects.create(
                group=group,
                title=fake.sentence(nb_words=5),
                message=fake.paragraph(nb_sentences=4),
                posted_by=poster,
            )
            announcements.append(announcement)
            # print(f"  Posted announcement in {group.name} by {poster.username}") # Too verbose
    return announcements

def create_leaderboard_user_stats(users):
    """Creates overall user stats for the leaderboard."""
    print("Creating leaderboard user stats...")
    leaderboard_stats = []
    for user in users:
        stats, created = LeaderboardUserStats.objects.get_or_create(user=user)
        stats.total_hours_given = Decimal(fake.random_int(min=0, max=200)) + Decimal(str(random.random())).quantize(Decimal('0.01')) # Use str() for Decimal conversion
        stats.total_hours_received = Decimal(fake.random_int(min=0, max=200)) + Decimal(str(random.random())).quantize(Decimal('0.01')) # Use str() for Decimal conversion
        stats.sessions_completed = fake.random_int(min=0, max=50)
        stats.save()
        leaderboard_stats.append(stats)
        print(f"  Created leaderboard stats for {user.username}")
    return leaderboard_stats

def create_wallets(users, initial_balance):
    """Creates wallets for users."""
    print("Creating wallets for users...")
    wallets = []
    for user in users:
        wallet, created = Wallet.objects.get_or_create(user=user)
        wallet.balance = initial_balance
        wallet.save()
        wallets.append(wallet)
        print(f"  Created wallet for {user.username} with balance {wallet.balance}h")
    return wallets

def create_bookings(users, skills, availability_slots, num_bookings):
    """Creates mock bookings."""
    print(f"Creating {num_bookings} bookings...")
    bookings = []
    # Filter for skills that are offered
    offered_skills = [skill for skill in skills if skill.is_offered]

    if not offered_skills or len(users) < 2 or not availability_slots:
        print("Warning: Not enough data to create bookings. Skipping booking creation.")
        return bookings

    for _ in range(num_bookings):
        booked_by = random.choice(users)
        # Ensure booked_for is different from booked_by
        potential_booked_for = [user for user in users if user != booked_by]
        if not potential_booked_for:
            continue
        booked_for = random.choice(potential_booked_for)

        # Find a skill offered by booked_for
        available_skills = [skill for skill in offered_skills if skill.user == booked_for]
        if not available_skills:
            continue
        skill = random.choice(available_skills)

        # Find an availability slot for booked_for that is not booked
        # Filter slots by the booked_for user
        user_available_slots = [slot for slot in availability_slots if slot.booked_for == booked_for and not slot.is_booked]

        # If no available slots for this user, try again with a different booked_for user
        if not user_available_slots:
             continue

        availability = random.choice(user_available_slots)

        # Calculate scheduled time based on availability slot (approximate)
        # This is a simplified approach, real-world would need more complex date/time logic
        # Ensure scheduled time is in the future
        now = timezone.now()
        today = now.date()
        current_weekday = today.weekday() # Monday is 0, Sunday is 6
        slot_weekday = availability.weekday

        # Calculate days until the next occurrence of the slot's weekday
        days_until_slot = (slot_weekday - current_weekday + 7) % 7
        scheduled_date = today + timedelta(days=days_until_slot)

        scheduled_datetime = timezone.make_aware(datetime.combine(scheduled_date, availability.start_time))

        # If the calculated time is in the past, schedule it for the following week
        if scheduled_datetime < now:
            scheduled_datetime += timedelta(days=7)


        duration = random.choice([30, 60, 90, 120]) # Duration in minutes
        # Ensure duration does not exceed slot duration
        slot_duration_minutes = (datetime.combine(scheduled_date, availability.end_time) - datetime.combine(scheduled_date, availability.start_time)).total_seconds() / 60
        duration = min(duration, int(slot_duration_minutes))
        if duration <= 0: # Skip if duration is not possible
            continue


        status = random.choice([
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED
        ])

        # Ensure unique constraint (though not explicitly defined, good practice to avoid duplicates)
        if Booking.objects.filter(
            skill=skill,
            booked_by=booked_by,
            booked_for=booked_for,
            scheduled_time=scheduled_datetime, # Use calculated datetime
        ).exists():
            continue

        booking = Booking.objects.create(
            skill=skill,
            booked_by=booked_by,
            booked_for=booked_for,
            status=status,
            scheduled_time=scheduled_datetime, # Use calculated datetime
            duration=duration,
            availability=availability,
            cancel_reason=fake.sentence() if status == BookingStatus.CANCELLED else None,
        )
        bookings.append(booking)
        print(f"  Created booking {booking.id}: {booked_by.username} -> {booked_for.username} for {skill.name} on {scheduled_datetime.strftime('%Y-%m-%d %H:%M')}")

    # After creating bookings, update availability slot status by saving bookings again
    # This triggers the save method logic to update is_booked
    print("Updating availability slot statuses based on bookings...")
    for booking in bookings:
        # Only mark slot as booked if booking status is not cancelled
        if booking.status != BookingStatus.CANCELLED:
             booking.availability.is_booked = True
             booking.availability.save()


    return bookings

def create_transactions(bookings, users, initial_balance):
    """Creates mock transactions based on bookings and initial credit."""
    print("Creating transactions...")
    transactions = []

    # Create initial credit transactions for all users
    print("  Creating initial wallet credit transactions...")
    for user in users:
        # Ensure wallet exists before creating transaction
        wallet, created = Wallet.objects.get_or_create(user=user)
        # Check if an initial credit transaction already exists for this user/wallet
        if not Transaction.objects.filter(wallet=wallet, reason='Initial account credit').exists():
             transaction = Transaction.objects.create(
                 wallet=wallet,
                 receiver=user, # User is the receiver of the initial credit
                 transaction_type='credit',
                 amount=initial_balance,
                 reason='Initial account credit',
             )
             transactions.append(transaction)
             # Update wallet balance immediately for initial credit
             wallet.balance = Decimal(wallet.balance) + initial_balance
             wallet.save()
             print(f"    Initial credit of {transaction.amount}h for {user.username}")
        else:
             # print(f"    Initial credit already exists for {user.username}") # Too verbose
             pass


    # Create transactions for completed bookings
    print("  Creating booking transactions for completed bookings...")
    completed_bookings = [b for b in bookings if b.status == BookingStatus.COMPLETED]

    for booking in completed_bookings:
        # Ensure transaction for this booking doesn't already exist
        if Transaction.objects.filter(booking=booking).exists():
            # print(f"    Transaction already exists for booking {booking.id}") # Too verbose
            continue # Skip if transaction already exists

        # Deduct from booked_by's wallet
        booked_by_wallet = booking.booked_by.wallet
        amount = Decimal(booking.duration / 60).quantize(Decimal('0.01')) # Convert minutes to hours

        # Ensure booked_by has sufficient balance before creating debit transaction
        # In a real app, this check would happen before confirming the booking
        # For mock data, we might just create the transaction and let the wallet balance go negative
        # or skip if balance is insufficient. Let's skip for now.
        if booked_by_wallet.balance >= amount:
            debit_transaction = Transaction.objects.create(
                wallet=booked_by_wallet,
                sender=booking.booked_by,
                receiver=booking.booked_for, # Receiver is the one providing the service
                transaction_type='debit',
                amount=amount,
                reason=f'Payment for booking {booking.id}',
                booking=booking,
            )
            transactions.append(debit_transaction)
            # Explicitly perform subtraction and reassign, ensuring Decimal types
            booked_by_wallet.balance = Decimal(booked_by_wallet.balance) - amount
            booked_by_wallet.save() # Save the wallet after updating balance
            print(f"    Debited {amount}h from {booking.booked_by.username} for booking {booking.id}")

            # Credit booked_for's wallet
            booked_for_wallet = booking.booked_for.wallet
            credit_transaction = Transaction.objects.create(
                wallet=booked_for_wallet,
                sender=booking.booked_by, # Sender is the one paying
                receiver=booking.booked_for,
                transaction_type='credit',
                amount=amount,
                reason=f'Credit for booking {booking.id}',
                booking=booking,
            )
            transactions.append(credit_transaction)
            # Explicitly perform addition and reassign, ensuring Decimal types
            booked_for_wallet.balance = Decimal(booked_for_wallet.balance) + amount
            booked_for_wallet.save() # Save the wallet after updating balance
            print(f"    Credited {amount}h to {booking.booked_for.username} for booking {booking.id}")
        else:
            print(f"    Skipping transaction for booking {booking.id}: {booking.booked_by.username} has insufficient balance ({booked_by_wallet.balance}h < {amount}h).")

    return transactions


def create_reviews(bookings, num_reviews):
    """Creates mock reviews for completed bookings."""
    print(f"Creating {num_reviews} reviews...")
    reviews = []
    completed_bookings = [b for b in bookings if b.status == BookingStatus.COMPLETED]

    if not completed_bookings:
        print("Warning: No completed bookings to review. Skipping review creation.")
        return reviews

    # Ensure we don't try to review more bookings than exist
    num_reviews_to_create = min(num_reviews, len(completed_bookings))

    # Get bookings that haven't been reviewed yet
    unreviewed_bookings = [b for b in completed_bookings if not Review.objects.filter(booking=b).exists()]

    # Ensure we don't try to review more unique bookings than available
    num_reviews_to_create = min(num_reviews_to_create, len(unreviewed_bookings))

    reviewed_bookings = random.sample(unreviewed_bookings, num_reviews_to_create)


    for booking in reviewed_bookings:
        # Double check if a review exists (should be handled by the unreviewed_bookings list)
        if not Review.objects.filter(booking=booking).exists():
            review = Review.objects.create(
                booking=booking,
                reviewer=booking.booked_by, # The person who booked leaves the review
                rating=random.randint(0, 5),
                comment=fake.paragraph(nb_sentences=random.randint(1, 3)) if random.random() > 0.2 else "", # Optional comment
            )
            reviews.append(review)
            print(f"  Created review for booking {booking.id} by {booking.booked_by.username}")
    return reviews

def create_chat_messages(groups, users, num_messages_per_group):
    """Creates mock chat messages in groups."""
    print("Creating group chat messages...")
    messages = []
    for group in groups:
        num_messages = random.randint(0, num_messages_per_group)
        members = list(group.members.all()) # Convert to list to use random.choice
        if not members:
            continue

        # Generate messages with increasing timestamps
        start_time = timezone.now() - timedelta(days=random.randint(1, 30)) # Start messages in the past
        time_increment = timedelta(minutes=random.randint(1, 10)) # Messages spaced out

        for i in range(num_messages):
            user = random.choice(members)
            message_time = start_time + time_increment * i

            message = ChatMessage.objects.create(
                user=user,
                room=group,
                message=fake.sentence(),
                message_type=random.choice(['text', 'voice']),
                created_at=message_time # Set message timestamp
            )
            messages.append(message)
            # print(f"  Msg in {group.name} by {user.username}") # Too verbose
    return messages

def create_private_messages(users, num_private_messages):
    """Creates mock private messages between users."""
    print(f"Creating {num_private_messages} private messages...")
    messages = []
    if len(users) < 2:
        print("Warning: Not enough users to create private messages. Skipping private message creation.")
        return messages

    # Create a list of potential sender-receiver pairs to ensure some conversations have multiple messages
    user_pairs = []
    for _ in range(num_private_messages // 5): # Create fewer unique pairs than total messages
        sender = random.choice(users)
        potential_receivers = [user for user in users if user != sender]
        if potential_receivers:
            receiver = random.choice(potential_receivers)
            user_pairs.append((sender, receiver))

    # If not enough pairs, just use random pairs
    while len(user_pairs) < num_private_messages:
         sender = random.choice(users)
         potential_receivers = [user for user in users if user != sender]
         if potential_receivers:
              receiver = random.choice(potential_receivers)
              user_pairs.append((sender, receiver))


    # Generate messages with increasing timestamps within each conversation
    conversations = {} # Dictionary to store messages by sender-receiver pair

    for i in range(num_private_messages):
        sender, receiver = random.choice(user_pairs) # Pick a random pair

        # Determine the start time for this conversation if it's new
        if (sender.id, receiver.id) not in conversations and (receiver.id, sender.id) not in conversations:
             start_time = timezone.now() - timedelta(days=random.randint(1, 60)) # Start conversations in the past
             conversations[(sender.id, receiver.id)] = {'start_time': start_time, 'messages': []}

        # Get the conversation start time (handle both sender->receiver and receiver->sender keys)
        conv_key = (sender.id, receiver.id) if (sender.id, receiver.id) in conversations else (receiver.id, sender.id)
        conv_info = conversations[conv_key]
        latest_message_time = conv_info['start_time'] + timedelta(minutes=len(conv_info['messages']) * random.randint(1, 5)) # Increment time


        message = PrivateChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=fake.sentence(),
            message_type=random.choice(['text', 'voice']),
            is_read=fake.boolean(chance_of_getting_true=70), # Most messages are read
            created_at=latest_message_time # Set message timestamp
        )
        messages.append(message)
        conv_info['messages'].append(message) # Add message to conversation list

        # print(f"  Private msg from {sender.username} to {receiver.username}") # Too verbose

    return messages


# --- Main Execution ---

if __name__ == "__main__":
    print("--- Starting Mock Data Generation ---")

    # Clean up existing data (optional, uncomment if needed)
    # print("Cleaning up existing data...")
    # EmailNotificationPreference.objects.all().delete()
    # Tag.objects.all().delete()
    # AvailabilitySlot.objects.all().delete()
    # Booking.objects.all().delete()
    # Review.objects.all().delete()
    # Group.objects.all().delete()
    # GroupMembership.objects.all().delete()
    # GroupUserStats.objects.all().delete()
    # GroupAnnouncement.objects.all().delete()
    # LeaderboardUserStats.objects.all().delete()
    # Wallet.objects.all().delete()
    # Transaction.objects.all().delete()
    # ChatMessage.objects.all().delete()
    # PrivateChatMessage.objects.all().delete()
    # Skill.objects.all().delete()
    # User.objects.filter(is_superuser=False, is_staff=False).delete() # Be careful with deleting users

    # Create data in order of dependencies
    created_users = create_users(NUM_USERS)
    if not created_users:
        print("No users created. Aborting data generation.")
    else:
        create_email_preferences(created_users)
        create_wallets(created_users, INITIAL_WALLET_BALANCE)
        create_leaderboard_user_stats(created_users)

        created_tags = create_tags(NUM_TAGS)
        # Pass created_tags (Tag objects) to create_skills
        created_skills = create_skills(created_users, created_tags, NUM_SKILLS_PER_USER)
        created_availability_slots = create_availability_slots(created_users, NUM_AVAILABILITY_SLOTS_PER_USER)

        created_groups = create_groups(created_users, NUM_GROUPS)
        if created_groups:
            created_memberships = add_group_members(created_groups, created_users, MAX_MEMBERS_PER_GROUP)
            create_group_user_stats(created_groups)
            create_group_announcements(created_groups, NUM_ANNOUNCEMENTS_PER_GROUP)
            create_chat_messages(created_groups, created_users, NUM_CHAT_MESSAGES_PER_GROUP)

        created_bookings = create_bookings(created_users, created_skills, created_availability_slots, NUM_BOOKINGS)
        create_transactions(created_bookings, created_users, INITIAL_WALLET_BALANCE) # Pass initial_balance for initial credits
        create_reviews(created_bookings, NUM_REVIEWS)
        create_private_messages(created_users, NUM_PRIVATE_MESSAGES)


    print("--- Mock Data Generation Complete ---")
