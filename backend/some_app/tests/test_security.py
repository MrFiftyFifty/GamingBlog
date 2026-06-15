from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import Section, Topic, Post, PrivateMessage, TopicBan


User = get_user_model()


class SecurityAPITestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.author = User.objects.create_user(
            username='security_author',
            email='security_author@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='security_other',
            email='security_other@example.com',
            password='TestPassword123'
        )

        self.third_user = User.objects.create_user(
            username='security_third',
            email='security_third@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='security_moderator',
            email='security_moderator@example.com',
            password='TestPassword123'
        )

        self.banned_user = User.objects.create_user(
            username='security_banned',
            email='security_banned@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.author,
            title='Security Section',
            slug='security-section',
            description='Section for security tests'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.author,
            title='Security Topic',
            content='Security topic content'
        )

        self.topic.moderators.add(self.moderator)

        self.post = Post.objects.create(
            author=self.author,
            topic=self.topic,
            content='Protected post content'
        )

        self.private_message = PrivateMessage.objects.create(
            sender=self.author,
            recipient=self.other_user,
            content='Private message for security test'
        )

        self.foreign_private_message = PrivateMessage.objects.create(
            sender=self.third_user,
            recipient=self.moderator,
            content='Foreign private message'
        )

    def tearDown(self):
        cache.clear()

    def test_login_is_throttled_after_five_failed_attempts(self):
        payload = {
            'email': 'wrong@example.com',
            'password': 'wrongpass'
        }

        responses = []

        for _ in range(6):
            response = self.client.post(
                '/api/token/',
                payload,
                format='json'
            )
            responses.append(response)

        self.assertEqual(
            responses[-1].status_code,
            status.HTTP_429_TOO_MANY_REQUESTS
        )

        self.assertIn(
            'Request was throttled',
            str(responses[-1].data.get('detail'))
        )

    def test_anonymous_user_cannot_create_post(self):
        payload = {
            'topic': self.topic.id,
            'content': 'Anonymous post'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ]
        )

        self.assertFalse(
            Post.objects.filter(content='Anonymous post').exists()
        )

    def test_regular_user_cannot_edit_foreign_post(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            f'/posts/{self.post.id}/',
            {
                'content': 'Hacked content'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.post.refresh_from_db()

        self.assertEqual(
            self.post.content,
            'Protected post content'
        )

    def test_user_cannot_read_foreign_private_message(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.get(
            f'/private-messages/{self.foreign_private_message.id}/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_regular_user_cannot_access_topic_moderation(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(
            f'/topics/{self.topic.id}/moderation/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_moderator_can_access_topic_moderation(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Security test ban'
        )

        self.client.force_authenticate(user=self.moderator)

        response = self.client.get(
            f'/topics/{self.topic.id}/moderation/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_banned_user_cannot_create_post_in_topic(self):
        TopicBan.objects.create(
            user=self.banned_user,
            topic=self.topic,
            reason='Security test ban'
        )

        self.client.force_authenticate(user=self.banned_user)

        response = self.client.post(
            '/posts/',
            {
                'topic': self.topic.id,
                'content': 'Post from banned user'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.assertFalse(
            Post.objects.filter(content='Post from banned user').exists()
        )