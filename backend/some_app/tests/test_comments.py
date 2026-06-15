from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    Comment,
    TopicBan,
    ModerationLog,
    Profile,
)


User = get_user_model()


class CommentsAPITestCase(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user(
            username='comment_author',
            email='comment_author@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='comment_other_user',
            email='comment_other_user@example.com',
            password='TestPassword123'
        )

        self.moderator = User.objects.create_user(
            username='comment_moderator',
            email='comment_moderator@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.author,
            title='StarCraft',
            slug='starcraft-comments',
            description='StarCraft comments section'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.author,
            title='Comment topic',
            content='Topic for comments'
        )

        self.topic.moderators.add(self.moderator)

        self.post = Post.objects.create(
            author=self.author,
            topic=self.topic,
            content='Post for comments'
        )

        self.comment = Comment.objects.create(
            author=self.author,
            post=self.post,
            content='Original comment'
        )

        Profile.objects.get_or_create(user=self.author)
        Profile.objects.get_or_create(user=self.other_user)
        Profile.objects.get_or_create(user=self.moderator)

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_can_list_comments(self):
        response = self.client.get('/comments/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['content'], self.comment.content)

    def test_anonymous_user_cannot_create_comment(self):
        payload = {
            'post': self.post.id,
            'content': 'Anonymous comment'
        }

        response = self.client.post(
            '/comments/',
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

    def test_authenticated_user_can_create_comment(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'post': self.post.id,
            'content': 'Comment from authenticated user'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Comment from authenticated user')
        self.assertEqual(response.data['author']['id'], self.other_user.id)

        comment = Comment.objects.get(id=response.data['id'])
        self.assertEqual(comment.author, self.other_user)
        self.assertEqual(comment.post, self.post)

    def test_authenticated_user_can_create_reply_to_comment(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'post': self.post.id,
            'parent': self.comment.id,
            'content': 'Reply to original comment'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Reply to original comment')
        self.assertEqual(response.data['parent'], self.comment.id)

        reply = Comment.objects.get(id=response.data['id'])
        self.assertEqual(reply.parent, self.comment)
        self.assertEqual(reply.author, self.other_user)

    def test_comment_list_returns_replies_inside_parent_comment(self):
        reply = Comment.objects.create(
            author=self.other_user,
            post=self.post,
            parent=self.comment,
            content='Nested reply'
        )

        response = self.client.get('/comments/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comment.id)
        self.assertEqual(len(results[0]['replies']), 1)
        self.assertEqual(results[0]['replies'][0]['id'], reply.id)
        self.assertEqual(results[0]['replies'][0]['content'], 'Nested reply')

    def test_banned_user_cannot_create_comment_in_topic(self):
        TopicBan.objects.create(
            user=self.other_user,
            topic=self.topic,
            reason='Test ban'
        )

        self.client.force_authenticate(user=self.other_user)

        payload = {
            'post': self.post.id,
            'content': 'Comment from banned user'
        }

        response = self.client.post(
            '/comments/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Comment.objects.filter(content='Comment from banned user').exists()
        )

    def test_author_can_edit_own_comment(self):
        self.client.force_authenticate(user=self.author)

        payload = {
            'content': 'Edited by author'
        }

        response = self.client.patch(
            f'/comments/{self.comment.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, 'Edited by author')

        log_exists = ModerationLog.objects.filter(
            target_user=self.author,
            action=ModerationLog.ACTION_EDIT_COMMENT
        ).exists()

        self.assertFalse(log_exists)

    def test_regular_user_cannot_edit_foreign_comment(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'content': 'Trying to edit foreign comment'
        }

        response = self.client.patch(
            f'/comments/{self.comment.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.comment.refresh_from_db()
        self.assertNotEqual(
            self.comment.content,
            'Trying to edit foreign comment'
        )

    def test_moderator_can_edit_foreign_comment_and_log_is_created(self):
        self.client.force_authenticate(user=self.moderator)

        payload = {
            'content': 'Edited by moderator'
        }

        response = self.client.patch(
            f'/comments/{self.comment.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, 'Edited by moderator')

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.author,
            action=ModerationLog.ACTION_EDIT_COMMENT,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)

    def test_moderator_can_delete_foreign_comment_and_log_is_created(self):
        comment_to_delete = Comment.objects.create(
            author=self.author,
            post=self.post,
            content='Comment to delete by moderator'
        )

        self.client.force_authenticate(user=self.moderator)

        response = self.client.delete(
            f'/comments/{comment_to_delete.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(
            Comment.objects.filter(id=comment_to_delete.id).exists()
        )

        log_exists = ModerationLog.objects.filter(
            moderator=self.moderator,
            target_user=self.author,
            action=ModerationLog.ACTION_DELETE_COMMENT,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)

    def test_like_foreign_comment_increases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/comments/{self.comment.id}/like/'
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
            f'/comments/{self.comment.id}/like/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile.refresh_from_db()
        self.assertEqual(profile.reputation, start_reputation)

    def test_duplicate_like_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        first_response = self.client.post(
            f'/comments/{self.comment.id}/like/'
        )

        second_response = self.client.post(
            f'/comments/{self.comment.id}/like/'
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second_response.data['detail'], 'already liked')

        profile = Profile.objects.get(user=self.author)
        self.assertEqual(profile.reputation, 1)

    def test_unlike_foreign_comment_decreases_author_reputation(self):
        self.client.force_authenticate(user=self.other_user)

        self.client.post(f'/comments/{self.comment.id}/like/')

        response = self.client.post(
            f'/comments/{self.comment.id}/unlike/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'unliked')
        self.assertEqual(response.data['likes_count'], 0)

        profile = Profile.objects.get(user=self.author)
        self.assertEqual(profile.reputation, 0)

    def test_unlike_without_like_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.post(
            f'/comments/{self.comment.id}/unlike/'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'not liked')

    def test_topic_author_can_edit_foreign_comment_in_own_topic(self):
        foreign_comment = Comment.objects.create(
            author=self.other_user,
            post=self.post,
            content='Foreign comment in topic'
        )

        self.client.force_authenticate(user=self.author)

        payload = {
            'content': 'Edited by topic author'
        }

        response = self.client.patch(
            f'/comments/{foreign_comment.id}/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        foreign_comment.refresh_from_db()
        self.assertEqual(foreign_comment.content, 'Edited by topic author')

        log_exists = ModerationLog.objects.filter(
            moderator=self.author,
            target_user=self.other_user,
            action=ModerationLog.ACTION_EDIT_COMMENT,
            topic=self.topic
        ).exists()

        self.assertTrue(log_exists)