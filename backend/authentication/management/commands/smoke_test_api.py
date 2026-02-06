import json
import re
from django.core.management.base import BaseCommand
from django.urls import URLPattern, URLResolver, get_resolver
from django.conf import settings
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone


def iter_patterns(patterns, prefix=""):
    for entry in patterns:
        if isinstance(entry, URLPattern):
            yield prefix + str(entry.pattern), entry.callback
        elif isinstance(entry, URLResolver):
            yield from iter_patterns(entry.url_patterns, prefix + str(entry.pattern))


def fill_path(path):
    # Replace Django path converters with sample values
    def repl(match):
        token = match.group(0)
        if token.startswith('<int'):
            return '1'
        if token.startswith('<uuid'):
            return '00000000-0000-0000-0000-000000000000'
        if token.startswith('<slug'):
            return 'test-slug'
        if token.startswith('<path'):
            return 'test'
        # default use 'test'
        return 'test'

    # match patterns like <int:pk> or <slug:slug>
    return re.sub(r"<[^>]+>", repl, path)


class Command(BaseCommand):
    help = 'Smoke-test all API endpoints (best-effort). Outputs backend/api_smoke_test_results.json'

    def handle(self, *args, **options):
        resolver = get_resolver(getattr(settings, 'ROOT_URLCONF', None))
        patterns = list(iter_patterns(resolver.url_patterns))

        client = APIClient()

        User = get_user_model()
        username = 'smoketestuser'
        email = 'smoketest@example.com'
        password = 'TestPass123!'

        user, created = User.objects.get_or_create(email=email, defaults={'username': username})
        if created:
            user.set_password(password)
            # mark verified if field exists
            if hasattr(user, 'email_verified'):
                user.email_verified = True
            user.save()

        results = []

        # Try to obtain token
        token = None
        try:
            r = client.post('/auth/login/', {'email': email, 'password': password}, format='json')
            if r.status_code == 200 and isinstance(r.data, dict):
                token = r.data.get('access') or r.data.get('token')
        except Exception:
            pass

        if token:
            client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        for path, callback in patterns:
            # skip admin media and static
            if path.startswith('admin/') or path.startswith('^media'):
                continue

            url = '/' + fill_path(path).lstrip('/')
            for method in ('get', 'post'):
                record = {'path': url, 'method': method.upper(), 'status_unauth': None, 'status_auth': None, 'error': None}
                try:
                    # Unauthenticated attempt
                    client.credentials()  # clear auth
                    fn = getattr(client, method)
                    resp = fn(url, format='json')
                    record['status_unauth'] = resp.status_code
                except Exception as e:
                    record['error'] = f'unauth_error: {e}'

                try:
                    if token:
                        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
                    fn = getattr(client, method)
                    resp = fn(url, format='json')
                    record['status_auth'] = resp.status_code
                except Exception as e:
                    record['error'] = (record.get('error') or '') + f' auth_error: {e}'

                results.append(record)

        out_path = settings.BASE_DIR / 'api_smoke_test_results.json'
        try:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, 'w') as f:
                json.dump(results, f, indent=2)
            self.stdout.write(self.style.SUCCESS(f'Wrote results to {out_path}'))
        except Exception as e:
            self.stderr.write(f'Failed to write results: {e}')
