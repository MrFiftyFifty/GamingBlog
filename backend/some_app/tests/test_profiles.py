from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import Profile


User = get_user_model()


class ProfilesAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='profile_user',
            email='profile_user@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='profile_other_user',
            email='profile_other_user@example.com',
            password='TestPassword123'
        )

        self.profile = Profile.objects.get(user=self.user)
        self.other_profile = Profile.objects.get(user=self.other_user)

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_profile_is_created_automatically_for_new_user(self):
        new_user = User.objects.create_user(
            username='new_profile_user',
            email='new_profile_user@example.com',
            password='TestPassword123'
        )

        self.assertTrue(
            Profile.objects.filter(user=new_user).exists()
        )

    def test_anonymous_user_can_list_profiles_or_get_permission_response(self):
        response = self.client.get('/profiles/')

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_authenticated_user_can_list_profiles(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/profiles/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        user_ids = [item['user'] for item in results]

        self.assertIn(self.user.id, user_ids)
        self.assertNotIn(self.other_user.id, user_ids)

    def test_authenticated_user_can_retrieve_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(f'/profiles/{self.profile.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.profile.id)
        self.assertEqual(response.data['user'], self.user.id)

    def test_user_can_update_own_status(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f'/profiles/{self.profile.id}/',
            {
                'status': 'Играю в StarCraft'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.status, 'Играю в StarCraft')

    def test_user_cannot_update_other_user_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f'/profiles/{self.other_profile.id}/',
            {
                'status': 'Hacked status'
            },
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_403_FORBIDDEN,
                status.HTTP_404_NOT_FOUND
            ]
        )

        self.other_profile.refresh_from_db()
        self.assertNotEqual(self.other_profile.status, 'Hacked status')

    def test_user_cannot_change_reputation_directly(self):
        self.client.force_authenticate(user=self.user)

        start_reputation = self.profile.reputation

        response = self.client.patch(
            f'/profiles/{self.profile.id}/',
            {
                'reputation': 9999
            },
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_403_FORBIDDEN
            ]
        )

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.reputation, start_reputation)

    def test_rating_level_newbie(self):
        self.profile.reputation = 0
        self.profile.save(update_fields=['reputation'])

        self.assertEqual(self.profile.rating_level, 'Новичок')

    def test_rating_level_active_user(self):
        self.profile.reputation = 10
        self.profile.save(update_fields=['reputation'])

        self.assertEqual(self.profile.rating_level, 'Активный участник')

    def test_rating_level_respected_user(self):
        self.profile.reputation = 50
        self.profile.save(update_fields=['reputation'])

        self.assertEqual(self.profile.rating_level, 'Уважаемый участник')

    def test_rating_level_legend(self):
        self.profile.reputation = 100
        self.profile.save(update_fields=['reputation'])

        self.assertEqual(self.profile.rating_level, 'Легенда форума')

    def test_profile_contains_steam_fields(self):
        self.profile.steam_id = '76561198060491698'
        self.profile.steam_nickname = 'SoulVayne'
        self.profile.steam_avatar = 'https://example.com/avatar.jpg'
        self.profile.save(
            update_fields=[
                'steam_id',
                'steam_nickname',
                'steam_avatar'
            ]
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(f'/profiles/{self.profile.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['steam_id'], '76561198060491698')
        self.assertEqual(response.data['steam_nickname'], 'SoulVayne')
        self.assertEqual(
            response.data['steam_avatar'],
            'https://example.com/avatar.jpg'
        )