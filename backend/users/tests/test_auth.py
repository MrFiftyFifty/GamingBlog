from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthAPITestCase(APITestCase):
    def setUp(self):
        self.user_email = 'auth_user@example.com'
        self.user_password = 'TestPassword123'

        self.user = User.objects.create_user(
            username='auth_user',
            email=self.user_email,
            password=self.user_password
        )

    def test_user_can_register(self):
        payload = {
            'username': 'new_user',
            'email': 'new_user@example.com',
            'password': 'TestPassword123'
        }

        response = self.client.post(
            '/api/register/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(email='new_user@example.com').exists()
        )

    def test_user_cannot_register_with_existing_email(self):
        payload = {
            'username': 'another_user',
            'email': self.user_email,
            'password': 'TestPassword123'
        }

        response = self.client.post(
            '/api/register/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_get_jwt_tokens(self):
        payload = {
            'email': self.user_email,
            'password': self.user_password
        }

        response = self.client.post(
            '/api/token/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_cannot_get_jwt_tokens_with_wrong_password(self):
        payload = {
            'email': self.user_email,
            'password': 'WrongPassword123'
        }

        response = self.client.post(
            '/api/token/',
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_401_UNAUTHORIZED
            ]
        )

    def test_refresh_token_returns_new_access_token(self):
        token_response = self.client.post(
            '/api/token/',
            {
                'email': self.user_email,
                'password': self.user_password
            },
            format='json'
        )

        refresh_token = token_response.data['refresh']

        response = self.client.post(
            '/api/token/refresh/',
            {
                'refresh': refresh_token
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_authenticated_user_can_access_profile_endpoint(self):
        token_response = self.client.post(
            '/api/token/',
            {
                'email': self.user_email,
                'password': self.user_password
            },
            format='json'
        )

        access_token = token_response.data['access']

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )

        response = self.client.get('/api/profile/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_user_cannot_access_profile_endpoint(self):
        response = self.client.get('/api/profile/')

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )