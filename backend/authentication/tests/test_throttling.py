from django.test import override_settings, TestCase
from rest_framework.test import APIClient


@override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    REST_FRAMEWORK={'DEFAULT_THROTTLE_RATES': {'login': '2/min', 'anon': '1000/day', 'user': '1000/day'}}
)
class ThrottlingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/login/'

    def test_login_throttle_triggers_after_limit(self):
        payload = {'email': 'no-such-user@example.com', 'password': 'badpassword'}

        # First two attempts should be processed (likely invalid credentials)
        r1 = self.client.post(self.url, payload, format='json')
        r2 = self.client.post(self.url, payload, format='json')

        self.assertIn(r1.status_code, (400, 401))
        self.assertIn(r2.status_code, (400, 401))

        # Third attempt should be throttled
        r3 = self.client.post(self.url, payload, format='json')
        self.assertEqual(r3.status_code, 429)
