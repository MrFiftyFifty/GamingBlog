from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    TopicBan,
    ModerationLog,
    Profile,
)


User = get_user_model()


class PostsAPITestCase(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user(
            username='post_author',
            email='post_author@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='post_other_user',
            email='post_other_user@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='post_moderator',
            email='post_moderator@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.author,
            title='StarCraft',
            slug='starcraft',
            description='StarCraft section'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.author,
            title='StarCraft topic',
            content='Topic content'
        )

        self.topic.moderators.add(self.moderator)

        self.post = Post.objects.create(
            author=self.author,
            topic=self.topic,
            content='Original post content'
        )

        Profile.objects.get_or_create(user=self.author)
        Profile.objects.get_or_create(user=self.other_user)
        Profile.objects.get_or_create(user=self.moderator)

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_can_list_posts(self):
        response = self.client.get('/posts/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['content'], self.post.content)

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
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_authenticated_user_can_create_post(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'topic': self.topic.id,
            'content': 'Post from authenticated user'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Post from authenticated user')
        self.assertEqual(response.data['author']['id'], self.other_user.id)

        post = Post.objects.get(id=response.data['id'])
        self.assertEqual(post.author, self.other_user)
        self.assertEqual(post.topic, self.topic)

    def test_banned_user_cannot_create_post_in_topic(self):
        TopicBan.objects.create(
            user=self.other_user,
            topic=self.topic,
            reason='Test ban'
        )

        self.client.force_authenticate(user=self.other_user)

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

    def test_author_can_edit_own_post(self):
        self.client.force_authenticate(user=self.author)

        payload = {
            'content': 'Edited by author'
        }

        response = self.client.patch(
            f'/posts/{self.post.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Edited by author')

        log_exists = ModerationLog.objects.filter(
            target_user=self.author,
            action=ModerationLog.ACTION_EDIT_POST
        ).exists()

        self.assertFalse(log_exists)

    def test_regular_user_cannot_edit_foreign_post(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'content': 'Trying to edit foreign post'
        }

        response = self.client.patch(
            f'/posts/{self.post.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.post.refresh_from_db()
        self.assertNotEqual(self.post.content, 'Trying to edit foreign post')

    def test_moderator_can_edit_foreign_post_and_log_is_created(self):
        self.client.force_authenticate(user=self.moderator)

        payload = {
            'content': 'Edited by moderator'
        }

        response = self.client.patch(
            f'/posts/{self.post.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.post.refresh_from_db()
        self.assertEqual(self.post.content, 'Edited by moderator')

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.author,
            action=ModerationLog.ACTION_EDIT_POST,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)

    def test_moderator_can_delete_foreign_post_and_log_is_created(self):
        post_to_delete = Post.objects.create(
            author=self.author,
            topic=self.topic,
            content='Post to delete by moderator'
        )

        self.client.force_authenticate(user=self.moderator)

        response = self.client.delete(
            f'/posts/{post_to_delete.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(
            Post.objects.filter(id=post_to_delete.id).exists()
        )

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.author,
            action=ModerationLog.ACTION_DELETE_POST,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)

    def test_like_foreign_post_increases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'liked')
        self.assertEqual(response.data['likes_count'], 1)

        profile = Profile.objects.get(user=self.author)
        self.assertEqual(profile.reputation, 1)

    def test_self_like_does_not_increase_reputation(self):
        self.client.force_authenticate(user=self.author)

        profile = Profile.objects.get(user=self.author)
        start_reputation = profile.reputation

        response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile.refresh_from_db()
        self.assertEqual(profile.reputation, start_reputation)

    def test_duplicate_like_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        first_response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        second_response = self.client.post(
            f'/posts/{self.post.id}/like/'
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second_response.data['detail'], 'already liked')

        profile = Profile.objects.get(user=self.author)
        self.assertEqual(profile.reputation, 1)

    def test_unlike_foreign_post_decreases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        self.client.post(f'/posts/{self.post.id}/like/')

        response = self.client.post(
            f'/posts/{self.post.id}/unlike/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'unliked')
        self.assertEqual(response.data['likes_count'], 0)

        profile = Profile.objects.get(user=self.author)
        self.assertEqual(profile.reputation, 0)

    def test_unlike_without_like_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/posts/{self.post.id}/unlike/'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'not liked')

    def test_topic_author_can_edit_post_in_own_topic(self):
        foreign_post = Post.objects.create(
            author=self.other_user,
            topic=self.topic,
            content='Foreign post in author topic'
        )

        self.client.force_authenticate(user=self.author)

        payload = {
            'content': 'Edited by topic author'
        }

        response = self.client.patch(
            f'/posts/{foreign_post.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        foreign_post.refresh_from_db()
        self.assertEqual(foreign_post.content, 'Edited by topic author')

        log_exists = ModerationLog.objects.filter(
            moderator=self.author,
            target_user=self.other_user,
            action=ModerationLog.ACTION_EDIT_POST,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)