from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import ServiceOffering, Skill, ServiceRequest

class ServiceOfferingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.skill = Skill.objects.create(name="Programming")  # Create required skill
        self.client.force_authenticate(user=self.user)  # Better for API tests

    def test_create_service_offering(self):
        data = {
            'title': 'Web Development',
            'description': 'Offering web development services',
            'skill': self.skill.id  # Add required field
        }
        response = self.client.post('/api/service-offerings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ServiceOffering.objects.count(), 1)
        self.assertEqual(ServiceOffering.objects.get().title, 'Web Development')

    def test_service_offering_list(self):
        ServiceOffering.objects.create(
            title="Web Design", 
            description="Offering web design services", 
            user=self.user,
            skill=self.skill  # Add required field
        )
        response = self.client.get('/api/service-offerings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class SkillTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)

    def test_create_skill(self):
        data = {
            'name': 'Python',
            # Remove description if your model doesn't have it
        }
        response = self.client.post('/api/skills/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Skill.objects.count(), 1)
        self.assertEqual(Skill.objects.get().name, 'Python')

    def test_skill_list(self):
        Skill.objects.create(name="Python")
        response = self.client.get('/api/skills/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class ServiceRequestTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.force_authenticate(user=self.user)
        self.skill = Skill.objects.create(name="Programming")
        self.service_offering = ServiceOffering.objects.create(
            title="Web Development", 
            description="Offering web development services", 
            user=self.user,
            skill=self.skill
        )

    def test_create_service_request(self):
        data = {
        'service_offering': self.service_offering.id,
        'skill': self.skill.id,
        'description': 'I need a website built',
        'title': 'Build My Website'  # ✅ Add this
    }
        response = self.client.post('/api/requests/', data, format='json')
        print("CREATE SR RESPONSE:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    
    def test_service_request_list(self):
        service_request = ServiceRequest.objects.create(
            user=self.user,
            skill=self.skill,
            service_offering=self.service_offering,
            description="Example request"
        )
        response = self.client.get('/api/requests/')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_status_action(self):
        service_request = ServiceRequest.objects.create(
            service_offering=self.service_offering, 
            description="Need website built", 
            user=self.user,
            skill=self.skill  # ✅ Add required skill here
        )
        url = f'/api/requests/{service_request.id}/update_status/'
        data = {'status': 'completed'}
        response = self.client.patch(url, data, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
