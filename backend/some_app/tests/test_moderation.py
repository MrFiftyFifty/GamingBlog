from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    TopicBan,
    ModerationLog,
)


User = get_user_model()


class ModerationAPITestCase(APITestCase):
    def setUp(self):
        self.topic_author = User.objects.create_user(
            username='moderation_topic_author',
            email='moderation_topic_author@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='moderation_moderator',
            email='moderation_moderator@example.com',
            password='TestPassword123'
        )

        self.regular_user = User.objects.create_user(
            username='moderation_regular_user',
            email='moderation_regular_user@example.com',
            password='TestPassword123'
        )

        self.banned_user = User.objects.create_user(
            username='moderation_banned_user',
            email='moderation_banned_user@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.topic_author,
            title='Moderation Section',
            slug='moderation-section',
            description='Section for moderation tests'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.topic_author,
            title='Moderation topic',
            content='Topic content for moderation'
        )

        self.topic.moderators.add(self.moderator)

        self.post = Post.objects.create(
            author=self.topic_author,
            topic=self.topic,
            content='Post for moderation'
        )

    def get_moderation_url(self):
        return f'/topics/{self.topic.id}/moderation/'

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def get_ban_action(self):
        return getattr(
            ModerationLog,
            'ACTION_BAN_USER',
            getattr(ModerationLog, 'ACTION_BAN', 'ban')
        )

    def get_unban_action(self):
        return getattr(
            ModerationLog,
            'ACTION_UNBAN_USER',
            getattr(ModerationLog, 'ACTION_UNBAN', 'unban')
        )

    def test_anonymous_user_cannot_list_topic_bans(self):
        response = self.client.get(self.get_moderation_url())

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_regular_user_cannot_list_topic_bans(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.get(self.get_moderation_url())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_ban_user_in_topic(self):
        self.client.force_authenticate(user=self.regular_user)

        payload = {
            'user': self.banned_user.id,
            'reason': 'Regular user tries to ban'
        }

        response = self.client.post(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.assertFalse(
            TopicBan.objects.filter(
                user=self.banned_user,
                topic=self.topic
            ).exists()
        )

    def test_moderator_can_ban_user_in_topic(self):
        self.client.force_authenticate(user=self.moderator)

        payload = {
            'user': self.banned_user.id,
            'reason': 'Test ban reason'
        }

        response = self.client.post(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_201_CREATED
            ]
        )

        topic_ban = TopicBan.objects.get(
            user=self.banned_user,
            topic=self.topic
        )

        self.assertEqual(topic_ban.reason, 'Test ban reason')

    def test_ban_user_creates_moderation_log(self):
        self.client.force_authenticate(user=self.moderator)

        payload = {
            'user': self.banned_user.id,
            'reason': 'Ban with log'
        }

        response = self.client.post(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_201_CREATED
            ]
        )

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.banned_user,
            topic=self.topic,
            action=self.get_ban_action()
        ).exists()

        self.assertTrue(log_exists)

    def test_banned_user_cannot_create_post_in_topic(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Already banned'
        )

        self.client.force_authenticate(user=self.banned_user)

        payload = {
            'topic': self.topic.id,
            'content': 'Post from banned user'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.assertFalse(
            Post.objects.filter(content='Post from banned user').exists()
        )

    def test_moderator_can_list_topic_bans(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Listed ban'
        )

        self.client.force_authenticate(user=self.moderator)

        response = self.client.get(self.get_moderation_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        user_ids = [item['user'] for item in results]
        reasons = [item['reason'] for item in results]

        self.assertIn(self.banned_user.id, user_ids)
        self.assertIn('Listed ban', reasons)

    def test_moderator_can_unban_user_in_topic(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Ban before unban'
        )

        self.client.force_authenticate(user=self.moderator)

        payload = {
            'user': self.banned_user.id
        }

        response = self.client.delete(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_204_NO_CONTENT
            ]
        )

        self.assertFalse(
            TopicBan.objects.filter(
                user=self.banned_user,
                topic=self.topic
            ).exists()
        )

    def test_unban_user_creates_moderation_log(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Ban before unban log'
        )

        self.client.force_authenticate(user=self.moderator)

        payload = {
            'user': self.banned_user.id
        }

        response = self.client.delete(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_204_NO_CONTENT
            ]
        )

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.banned_user,
            topic=self.topic,
            action=self.get_unban_action()
        ).exists()

        self.assertTrue(log_exists)

    def test_regular_user_cannot_unban_user_in_topic(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Ban before failed unban'
        )

        self.client.force_authenticate(user=self.regular_user)

        payload = {
            'user': self.banned_user.id
        }

        response = self.client.delete(
            self.get_moderation_url(),
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.assertTrue(
            TopicBan.objects.filter(
                user=self.banned_user,
                topic=self.topic
            ).exists()
        )