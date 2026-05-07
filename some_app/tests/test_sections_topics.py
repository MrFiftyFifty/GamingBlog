from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Tag,
    Topic,
    ModerationLog,
)


User = get_user_model()


class SectionsTopicsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='topic_user',
            email='topic_user@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='other_topic_user',
            email='other_topic_user@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='topic_moderator',
            email='topic_moderator@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.user,
            title='StarCraft',
            slug='starcraft',
            description='StarCraft section'
        )

        self.other_section = Section.objects.create(
            owner=self.other_user,
            title='RPG',
            slug='rpg',
            description='RPG section'
        )

        self.tag = Tag.objects.create(
            name='Zerg',
            slug='zerg'
        )

        self.other_tag = Tag.objects.create(
            name='Terran',
            slug='terran'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.user,
            title='Zerg build order',
            content='Discussion about zerg builds',
            is_pinned=False
        )

        self.topic.tags.add(self.tag)
        self.topic.moderators.add(self.moderator)

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_can_list_sections(self):
        response = self.client.get('/api/forum/sections/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        titles = [item['title'] for item in results]

        self.assertIn('StarCraft', titles)
        self.assertIn('RPG', titles)

    def test_authenticated_user_can_create_section(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'title': 'MMO',
            'slug': 'mmo',
            'description': 'MMO games section'
        }

        response = self.client.post(
            '/api/forum/sections/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'MMO')
        self.assertEqual(response.data['slug'], 'mmo')

        section = Section.objects.get(slug='mmo')
        self.assertEqual(section.owner, self.other_user)

    def test_section_slug_must_be_unique(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'title': 'Another StarCraft',
            'slug': 'starcraft',
            'description': 'Duplicate slug'
        }

        response = self.client.post(
            '/api/forum/sections/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            Section.objects.filter(title='Another StarCraft').exists()
        )

    def test_get_topics_by_section_slug(self):
        response = self.client.get(
            '/api/forum/sections/starcraft/topics/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.topic.title)

    def test_get_topics_by_wrong_section_slug_returns_404(self):
        response = self.client.get(
            '/api/forum/sections/unknown-section/topics/'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_anonymous_user_cannot_create_topic(self):
        payload = {
            'section_slug': 'starcraft',
            'tag_slugs': ['zerg'],
            'title': 'Anonymous topic',
            'content': 'Anonymous content'
        }

        response = self.client.post(
            '/topics/',
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

    def test_authenticated_user_can_create_topic_with_section_and_tags(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'section_slug': 'starcraft',
            'tag_slugs': ['zerg', 'terran'],
            'title': 'New StarCraft topic',
            'content': 'New topic content'
        }

        response = self.client.post(
            '/topics/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New StarCraft topic')
        self.assertEqual(response.data['author'], self.other_user.id)
        self.assertEqual(response.data['section']['slug'], 'starcraft')

        tag_slugs = [tag['slug'] for tag in response.data['tags']]
        self.assertIn('zerg', tag_slugs)
        self.assertIn('terran', tag_slugs)

    def test_create_topic_with_unknown_tag_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'section_slug': 'starcraft',
            'tag_slugs': ['unknown-tag'],
            'title': 'Topic with wrong tag',
            'content': 'Content'
        }

        response = self.client.post(
            '/topics/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filter_topics_by_tag(self):
        response = self.client.get('/topics/?tag=zerg')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.topic.title)

    def test_filter_topics_by_unknown_tag_returns_empty_list(self):
        response = self.client.get('/topics/?tag=unknown')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 0)

    def test_search_topics_by_title(self):
        response = self.client.get('/topics/?search=Zerg')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.topic.title)

    def test_author_can_edit_own_topic(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            'title': 'Updated own topic'
        }

        response = self.client.patch(
            f'/topics/{self.topic.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.topic.refresh_from_db()
        self.assertEqual(self.topic.title, 'Updated own topic')

    def test_regular_user_cannot_edit_foreign_topic(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'title': 'Trying to edit foreign topic'
        }

        response = self.client.patch(
            f'/topics/{self.topic.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.topic.refresh_from_db()
        self.assertNotEqual(
            self.topic.title,
            'Trying to edit foreign topic'
        )

    def test_moderator_can_edit_foreign_topic_and_log_is_created(self):
        self.client.force_authenticate(user=self.moderator)

        payload = {
            'title': 'Edited by topic moderator'
        }

        response = self.client.patch(
            f'/topics/{self.topic.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.topic.refresh_from_db()
        self.assertEqual(self.topic.title, 'Edited by topic moderator')

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.user,
            action=ModerationLog.ACTION_EDIT_TOPIC,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)