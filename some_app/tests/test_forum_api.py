from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Tag,
    Topic,
    Post,
    Comment,
    BannedWord,
    ModerationLog,
    Profile,
)


User = get_user_model()


class ForumAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user_test',
            email='user_test@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='other_user',
            email='other_user@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='moderator_test',
            email='moderator_test@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.user,
            title='StarCraft',
            slug='starcraft',
            description='StarCraft section'
        )

        self.tag = Tag.objects.create(
            name='Zerg',
            slug='zerg'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.user,
            title='StarCraft topic',
            content='Topic content'
        )

        self.topic.tags.add(self.tag)
        self.topic.moderators.add(self.moderator)

        self.post = Post.objects.create(
            author=self.user,
            topic=self.topic,
            content='First post'
        )

        self.comment = Comment.objects.create(
            author=self.user,
            post=self.post,
            content='First comment'
        )

    def test_anonymous_can_read_topics(self):
        response = self.client.get('/topics/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_authenticated_user_can_create_topic_with_tag(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'section_slug': 'starcraft',
            'tag_slugs': ['zerg'],
            'title': 'New zerg topic',
            'content': 'New topic content'
        }

        response = self.client.post('/topics/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New zerg topic')
        self.assertEqual(response.data['author'], self.other_user.id)
        self.assertEqual(response.data['tags'][0]['slug'], 'zerg')

    def test_filter_topics_by_tag(self):
        response = self.client.get('/topics/?tag=zerg')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], self.topic.title)

    def test_anonymous_cannot_create_post(self):
        payload = {
            'topic': self.topic.id,
            'content': 'Anonymous post'
        }

        response = self.client.post('/posts/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_post(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'topic': self.topic.id,
            'content': 'Authenticated post'
        }

        response = self.client.post('/posts/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Authenticated post')
        self.assertEqual(response.data['author']['id'], self.other_user.id)

    def test_like_post_increases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(f'/posts/{self.post.id}/like/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.reputation, 1)

    def test_unlike_post_decreases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        self.client.post(f'/posts/{self.post.id}/like/')
        response = self.client.post(f'/posts/{self.post.id}/unlike/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.reputation, 0)

    def test_like_comment_increases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(f'/comments/{self.comment.id}/like/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = Profile.objects.get(user=self.user)
        self.assertEqual(profile.reputation, 1)

    def test_banned_word_blocks_post_creation(self):
        BannedWord.objects.create(word='badword', is_active=True)

        self.client.force_authenticate(user=self.other_user)

        payload = {
            'topic': self.topic.id,
            'content': 'This text contains badword'
        }

        response = self.client.post('/posts/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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
            target_user=self.user,
            action=ModerationLog.ACTION_EDIT_POST
        ).exists()

        self.assertTrue(log_exists)

    def test_regular_user_cannot_edit_foreign_post(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'content': 'Hacked content'
        }

        response = self.client.patch(
            f'/posts/{self.post.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_private_message_can_be_sent(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            'recipient_id': self.other_user.id,
            'content': 'Hello private message'
        }

        response = self.client.post(
            '/private-messages/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Hello private message')
        self.assertEqual(response.data['recipient_username'], self.other_user.username)