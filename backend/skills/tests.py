from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Skill

User = get_user_model()

class SkillAPITestCase(TestCase):
    def setUp(self):
        """Set up test users and sample skills"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)

        self.skill = Skill.objects.create(
            user=self.user,
            name="Python Programming",
            description="Teaching Python concepts",
            is_offered=True,
            location="remote",
            address="Virtual",
            tags=["python", "coding"],
            is_visible=True
        )

    def test_list_skills(self):
        """Test retrieving a list of skills"""
        response = self.client.get("/skills/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_create_skill(self):
        """Test creating a new skill"""
        payload = {
            "name": "Django Development",
            "description": "Web development with Django",
            "is_offered": True,
            "location": "remote",
            "tags": ["django", "webdev"],
            "is_visible": True
        }
        response = self.client.post("/skills/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_skill(self):
        """Test retrieving a specific skill"""
        response = self.client.get(f"/skills/{self.skill.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], self.skill.name)

    def test_update_skill(self):
        """Test updating a skill"""
        payload = {"name": "Advanced Python"}
        response = self.client.patch(f"/skills/{self.skill.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Advanced Python")

    def test_delete_skill(self):
        """Test deleting a skill"""
        response = self.client.delete(f"/skills/{self.skill.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Skill.objects.filter(id=self.skill.id).exists())

    def test_search_skills(self):
        """Test searching for skills"""
        response = self.client.get("/skills/search/?search=python")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_my_skills_view(self):
        """Test retrieving authenticated user's skills"""
        response = self.client.get("/skills/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_offered_skills_view(self):
        """Test retrieving offered skills"""
        response = self.client.get("/skills/offered/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_requested_skills_view(self):
        """Test retrieving requested skills"""
        response = self.client.get("/skills/requested/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ✅ ADDED FUNCTIONALITY: Test retrieving all unique skill tags
    def test_skill_tags_view(self):
        """Test retrieving all unique skill tags"""
        response = self.client.get("/skills/tags/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_tags = response.json()
        self.assertIn("python", returned_tags)  # Ensure 'python' tag is returned
        self.assertIn("coding", returned_tags)

    # ✅ ADDED FUNCTIONALITY: Test filtering skills by tag (SQLite Compatible)
def test_filter_skills_by_tag(self):
    response = self.client.get("/skills/?tag=python")
    response_data = response.json()  # Ensure this is a list of dictionaries

    if isinstance(response_data, list):  # Prevent errors if response is invalid
        filtered_skills = [skill for skill in response_data if "python" in skill.get("tags", [])]
    else:
        filtered_skills = []  # Avoid errors

    self.assertTrue(filtered_skills, "Expected skills with 'python' tag, but found none.")
