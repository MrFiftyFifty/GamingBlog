from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    Comment,
    BannedWord,
)


User = get_user_model()


class BannedWordsAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='banned_words_admin',
            email='banned_words_admin@example.com',
            password='TestPassword123'
        )

        self.user = User.objects.create_user(
            username='banned_words_user',
            email='banned_words_user@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.user,
            title='Banned Words Section',
            slug='banned-words-section',
            description='Section for banned words tests'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.user,
            title='Clean topic',
            content='Clean topic content'
        )

        self.post = Post.objects.create(
            author=self.user,
            topic=self.topic,
            content='Clean post content'
        )

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_admin_can_create_banned_word(self):
        self.client.force_authenticate(user=self.admin)

        payload = {
            'word': 'badword',
            'is_active': True
        }

        response = self.client.post(
            '/banned-words/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['word'], 'badword')
        self.assertTrue(response.data['is_active'])

        self.assertTrue(
            BannedWord.objects.filter(word='badword').exists()
        )

    def test_regular_user_cannot_create_banned_word(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            'word': 'badword',
            'is_active': True
        }

        response = self.client.post(
            '/banned-words/',
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

        self.assertFalse(
            BannedWord.objects.filter(word='badword').exists()
        )

    def test_admin_can_list_banned_words(self):
        BannedWord.objects.create(
            word='badword',
            is_active=True
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.get('/banned-words/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        words = [item['word'] for item in results]

        self.assertIn('badword', words)

    def test_active_banned_word_blocks_topic_title(self):
        BannedWord.objects.create(
            word='badword',
            is_active=True
        )

        self.client.force_authenticate(user=self.user)

        payload = {
            'section_slug': 'banned-words-section',
            'title': 'This title has badword',
            'content': 'Clean content'
        }

        response = self.client.post(
            '/topics/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Topic.objects.filter(title='This title has badword').exists()
        )

    def test_active_banned_word_blocks_topic_content(self):
        BannedWord.objects.create(
            word='badword',
            is_active=True
        )

        self.client.force_authenticate(user=self.user)

        payload = {
            'section_slug': 'banned-words-section',
            'title': 'Clean title',
            'content': 'This content has badword'
        }

        response = self.client.post(
            '/topics/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Topic.objects.filter(title='Clean title').exists()
        )

    def test_active_banned_word_blocks_post_content(self):
        BannedWord.objects.create(
            word='badword',
            is_active=True
        )

        self.client.force_authenticate(user=self.user)

        payload = {
            'topic': self.topic.id,
            'content': 'This post has badword'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Post.objects.filter(content='This post has badword').exists()
        )

    def test_active_banned_word_blocks_comment_content(self):
        BannedWord.objects.create(
            word='badword',
            is_active=True
        )

        self.client.force_authenticate(user=self.user)

        payload = {
            'post': self.post.id,
            'content': 'This comment has badword'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Comment.objects.filter(content='This comment has badword').exists()
        )

    def test_inactive_banned_word_does_not_block_content(self):
        BannedWord.objects.create(
            word='badword',
            is_active=False
        )

        self.client.force_authenticate(user=self.user)

        payload = {
            'topic': self.topic.id,
            'content': 'This post has badword but word is inactive'
        }

        response = self.client.post(
            '/posts/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Post.objects.filter(
                content='This post has badword but word is inactive'
            ).exists()
        )

    def test_banned_word_is_normalized_to_lowercase(self):
        self.client.force_authenticate(user=self.admin)

        payload = {
            'word': '  BadWord  ',
            'is_active': True
        }

        response = self.client.post(
            '/banned-words/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['word'], 'badword')

        self.assertTrue(
            BannedWord.objects.filter(word='badword').exists()
        )