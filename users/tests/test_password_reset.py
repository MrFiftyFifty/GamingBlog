from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import override_settings

from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


@override_settings(
    DEBUG=True,
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='http://127.0.0.1:3000'
)
class PasswordResetAPITestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.email = 'reset_user@example.com'
        self.old_password = 'OldPassword123'
        self.new_password = 'NewStrongPassword12345'

        self.user = User.objects.create_user(
            username='reset_user',
            email=self.email,
            password=self.old_password
        )

        mail.outbox = []

    def tearDown(self):
        cache.clear()

    def test_password_reset_request_for_existing_email_returns_200_and_sends_email(self):
        payload = {
            'email': self.email
        }

        response = self.client.post(
            '/api/password-reset/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertIn('debug', response.data)
        self.assertIn('uid', response.data['debug'])
        self.assertIn('token', response.data['debug'])
        self.assertIn('reset_url', response.data['debug'])

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.email])
        self.assertIn('Восстановление пароля', mail.outbox[0].subject)

    def test_password_reset_request_for_unknown_email_returns_200_without_email_leak(self):
        payload = {
            'email': 'unknown@example.com'
        }

        response = self.client.post(
            '/api/password-reset/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertNotIn('debug', response.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_changes_password(self):
        reset_response = self.client.post(
            '/api/password-reset/',
            {
                'email': self.email
            },
            format='json'
        )

        uid = reset_response.data['debug']['uid']
        token = reset_response.data['debug']['token']

        confirm_response = self.client.post(
            '/api/password-reset-confirm/',
            {
                'uid': uid,
                'token': token,
                'new_password': self.new_password,
                'new_password_confirm': self.new_password
            },
            format='json'
        )

        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            confirm_response.data['detail'],
            'Пароль успешно изменён.'
        )

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.new_password))
        self.assertFalse(self.user.check_password(self.old_password))

    def test_user_can_get_jwt_with_new_password_after_password_reset(self):
        reset_response = self.client.post(
            '/api/password-reset/',
            {
                'email': self.email
            },
            format='json'
        )

        uid = reset_response.data['debug']['uid']
        token = reset_response.data['debug']['token']

        self.client.post(
            '/api/password-reset-confirm/',
            {
                'uid': uid,
                'token': token,
                'new_password': self.new_password,
                'new_password_confirm': self.new_password
            },
            format='json'
        )

        token_response = self.client.post(
            '/api/token/',
            {
                'email': self.email,
                'password': self.new_password
            },
            format='json'
        )

        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', token_response.data)
        self.assertIn('refresh', token_response.data)

    def test_password_reset_confirm_rejects_invalid_token(self):
        reset_response = self.client.post(
            '/api/password-reset/',
            {
                'email': self.email
            },
            format='json'
        )

        uid = reset_response.data['debug']['uid']

        response = self.client.post(
            '/api/password-reset-confirm/',
            {
                'uid': uid,
                'token': 'invalid-token',
                'new_password': self.new_password,
                'new_password_confirm': self.new_password
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('token', response.data)

    def test_password_reset_confirm_rejects_password_mismatch(self):
        reset_response = self.client.post(
            '/api/password-reset/',
            {
                'email': self.email
            },
            format='json'
        )

        uid = reset_response.data['debug']['uid']
        token = reset_response.data['debug']['token']

        response = self.client.post(
            '/api/password-reset-confirm/',
            {
                'uid': uid,
                'token': token,
                'new_password': self.new_password,
                'new_password_confirm': 'DifferentPassword12345'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password_confirm', response.data)