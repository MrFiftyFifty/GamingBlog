from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    Comment,
    Notification,
)


User = get_user_model()


class NotificationsAPITestCase(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user(
            username='notification_author',
            email='notification_author@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='notification_other_user',
            email='notification_other_user@example.com',
            password='TestPassword123'
        )

        self.mentioned_user = User.objects.create_user(
            username='MentionedUser',
            email='mentioned_user@example.com',
            password='TestPassword123'
        )

        self.third_user = User.objects.create_user(
            username='notification_third_user',
            email='notification_third_user@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.author,
            title='Notifications Section',
            slug='notifications-section',
            description='Section for notification tests'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.author,
            title='Notifications topic',
            content='Topic content'
        )

        self.post = Post.objects.create(
            author=self.author,
            topic=self.topic,
            content='Post for notifications'
        )

        self.comment = Comment.objects.create(
            author=self.author,
            post=self.post,
            content='Comment for notifications'
        )

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_cannot_list_notifications(self):
        response = self.client.get('/notifications/')

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_notification_list_returns_only_current_user_notifications(self):
        Notification.objects.create(
            sender=self.other_user,
            recipient=self.author,
            notification_type='like',
            post=self.post
        )

        Notification.objects.create(
            sender=self.author,
            recipient=self.third_user,
            notification_type='like',
            post=self.post
        )

        self.client.force_authenticate(user=self.author)

        response = self.client.get('/notifications/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['recipient'], self.author.id)
        self.assertEqual(results[0]['sender']['id'], self.other_user.id)

    def test_like_post_creates_notification_for_post_author(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.author,
            notification_type='like',
            post=self.post
        ).exists()

        self.assertTrue(notification_exists)

    def test_self_like_post_does_not_create_notification(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notification_exists = Notification.objects.filter(
            sender=self.author,
            recipient=self.author,
            notification_type='like',
            post=self.post
        ).exists()

        self.assertFalse(notification_exists)

    def test_like_comment_creates_notification_for_comment_author(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/comments/{self.comment.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.author,
            notification_type='like',
            comment=self.comment
        ).exists()

        self.assertTrue(notification_exists)

    def test_comment_on_post_creates_notification_for_post_author(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'post': self.post.id,
            'content': 'New comment from another user'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_comment = Comment.objects.get(id=response.data['id'])

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.author,
            notification_type='comment',
            post=self.post,
            comment=created_comment
        ).exists()

        self.assertTrue(notification_exists)

    def test_comment_on_own_post_does_not_create_comment_notification(self):
        self.client.force_authenticate(user=self.author)

        payload = {
            'post': self.post.id,
            'content': 'Comment on own post'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_comment = Comment.objects.get(id=response.data['id'])

        notification_exists = Notification.objects.filter(
            sender=self.author,
            recipient=self.author,
            notification_type='comment',
            post=self.post,
            comment=created_comment
        ).exists()

        self.assertFalse(notification_exists)

    def test_mention_in_post_creates_notification_for_mentioned_user(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'topic': self.topic.id,
            'content': '@MentionedUser, check this post please'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_post = Post.objects.get(id=response.data['id'])

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.mentioned_user,
            notification_type='mention',
            post=created_post
        ).exists()

        self.assertTrue(notification_exists)

    def test_mention_in_comment_creates_notification_for_mentioned_user(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'post': self.post.id,
            'content': '@MentionedUser, check this comment please'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_comment = Comment.objects.get(id=response.data['id'])

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.mentioned_user,
            notification_type='mention',
            post=self.post,
            comment=created_comment
        ).exists()

        self.assertTrue(notification_exists)

    def test_mention_self_does_not_create_notification_for_self(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'topic': self.topic.id,
            'content': '@notification_other_user self mention test'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_post = Post.objects.get(id=response.data['id'])

        notification_exists = Notification.objects.filter(
            sender=self.other_user,
            recipient=self.other_user,
            notification_type='mention',
            post=created_post
        ).exists()

        self.assertFalse(notification_exists)