from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import Profile


User = get_user_model()


class SocialAccountAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='social_user',
            email='social_user@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='other_social_user',
            email='other_social_user@example.com',
            password='TestPassword123'
        )

        self.steam_account = SocialAccount.objects.create(
            user=self.user,
            provider='steam',
            uid='76561198060491698',
            extra_data={
                'personaname': 'SoulVayne',
                'avatarfull': 'https://example.com/avatar.jpg'
            }
        )

        self.google_account = SocialAccount.objects.create(
            user=self.user,
            provider='google',
            uid='google-123',
            extra_data={
                'email': 'social_user@example.com'
            }
        )

        self.other_steam_account = SocialAccount.objects.create(
            user=self.other_user,
            provider='steam',
            uid='76561111111111111',
            extra_data={
                'personaname': 'OtherUser'
            }
        )

        self.profile, created = Profile.objects.get_or_create(
            user=self.user
        )

        self.profile.steam_id = '76561198060491698'
        self.profile.steam_nickname = 'SoulVayne'
        self.profile.steam_avatar = 'https://example.com/avatar.jpg'
        self.profile.save()

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_cannot_list_social_accounts(self):
        response = self.client.get('/api/social-accounts/')

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_user_can_list_only_own_social_accounts(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/social-accounts/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        providers = [item['provider'] for item in results]
        uids = [item['uid'] for item in results]

        self.assertEqual(len(results), 2)
        self.assertIn('steam', providers)
        self.assertIn('google', providers)
        self.assertIn('76561198060491698', uids)
        self.assertNotIn('76561111111111111', uids)

    def test_user_cannot_delete_other_user_social_account(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f'/api/social-accounts/{self.other_steam_account.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertTrue(
            SocialAccount.objects.filter(
                id=self.other_steam_account.id
            ).exists()
        )

    def test_user_can_disconnect_own_social_account_if_password_exists(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f'/api/social-accounts/{self.google_account.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['detail'],
            'Социальный аккаунт успешно отвязан.'
        )

        self.assertFalse(
            SocialAccount.objects.filter(
                id=self.google_account.id
            ).exists()
        )

        self.assertTrue(
            SocialAccount.objects.filter(
                id=self.steam_account.id
            ).exists()
        )

    def test_disconnect_steam_account_clears_profile_steam_fields(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(
            f'/api/social-accounts/{self.steam_account.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.profile.refresh_from_db()

        self.assertEqual(self.profile.steam_id, '')
        self.assertEqual(self.profile.steam_nickname, '')
        self.assertEqual(self.profile.steam_avatar, '')

    def test_user_cannot_disconnect_last_social_account_without_password(self):
        user_without_password = User.objects.create_user(
            username='no_password_user',
            email='no_password_user@example.com'
        )
        user_without_password.set_unusable_password()
        user_without_password.save()

        social_account = SocialAccount.objects.create(
            user=user_without_password,
            provider='steam',
            uid='76562222222222222',
            extra_data={
                'personaname': 'NoPasswordUser'
            }
        )

        self.client.force_authenticate(user=user_without_password)

        response = self.client.delete(
            f'/api/social-accounts/{social_account.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

        self.assertTrue(
            SocialAccount.objects.filter(
                id=social_account.id
            ).exists()
        )