from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import (
    Section,
    Topic,
    Post,
    Comment,
    ContentReport,
)


User = get_user_model()


class ContentReportsAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='reports_admin',
            email='reports_admin@example.com',
            password='TestPassword123'
        )

        self.user = User.objects.create_user(
            username='reports_user',
            email='reports_user@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='reports_other_user',
            email='reports_other_user@example.com',
            password='TestPassword123'
        )

        self.section = Section.objects.create(
            owner=self.user,
            title='Reports Section',
            slug='reports-section',
            description='Section for report tests'
        )

        self.topic = Topic.objects.create(
            section=self.section,
            author=self.user,
            title='Reported topic',
            content='Topic content'
        )

        self.post = Post.objects.create(
            author=self.user,
            topic=self.topic,
            content='Reported post content'
        )

        self.comment = Comment.objects.create(
            author=self.user,
            post=self.post,
            content='Reported comment content'
        )

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_cannot_create_report(self):
        payload = {
            'target_type': 'post',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'Anonymous report'
        }

        response = self.client.post(
            '/reports/',
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

        self.assertEqual(ContentReport.objects.count(), 0)

    def test_authenticated_user_can_report_topic(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'topic',
            'target_id': self.topic.id,
            'reason': 'insult',
            'description': 'Topic contains inappropriate content'
        }

        response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reporter'], self.other_user.id)
        self.assertEqual(response.data['reported_object_type'], 'topic')
        self.assertEqual(response.data['reported_object_id'], self.topic.id)

        report = ContentReport.objects.get(id=response.data['id'])
        self.assertEqual(report.reporter, self.other_user)
        self.assertEqual(report.object_id, self.topic.id)

    def test_authenticated_user_can_report_post(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'post',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'Post contains inappropriate content'
        }

        response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reported_object_type'], 'post')
        self.assertEqual(response.data['reported_object_id'], self.post.id)

        report = ContentReport.objects.get(id=response.data['id'])
        self.assertEqual(report.reporter, self.other_user)
        self.assertEqual(report.object_id, self.post.id)

    def test_authenticated_user_can_report_comment(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'comment',
            'target_id': self.comment.id,
            'reason': 'insult',
            'description': 'Comment contains inappropriate content'
        }

        response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reported_object_type'], 'comment')
        self.assertEqual(response.data['reported_object_id'], self.comment.id)

        report = ContentReport.objects.get(id=response.data['id'])
        self.assertEqual(report.reporter, self.other_user)
        self.assertEqual(report.object_id, self.comment.id)

    def test_report_with_unknown_target_type_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'unknown',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'Wrong target type'
        }

        response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContentReport.objects.count(), 0)

    def test_report_with_unknown_target_id_returns_400(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'post',
            'target_id': 999999,
            'reason': 'insult',
            'description': 'Wrong target id'
        }

        response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContentReport.objects.count(), 0)

    def test_user_cannot_report_same_content_twice(self):
        self.client.force_authenticate(user=self.other_user)

        payload = {
            'target_type': 'post',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'Duplicate report'
        }

        first_response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        second_response = self.client.post(
            '/reports/',
            payload,
            format='json'
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(
            ContentReport.objects.filter(reporter=self.other_user).count(),
            1
        )

    def test_different_users_can_report_same_content(self):
        self.client.force_authenticate(user=self.other_user)

        first_payload = {
            'target_type': 'post',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'First user report'
        }

        first_response = self.client.post(
            '/reports/',
            first_payload,
            format='json'
        )

        self.client.force_authenticate(user=self.admin)

        second_payload = {
            'target_type': 'post',
            'target_id': self.post.id,
            'reason': 'insult',
            'description': 'Second user report'
        }

        second_response = self.client.post(
            '/reports/',
            second_payload,
            format='json'
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContentReport.objects.count(), 2)

    def test_admin_can_list_reports(self):
        ContentReport.objects.create(
            reporter=self.other_user,
            content_object=self.post,
            reason='insult',
            description='Report for admin list'
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.get('/reports/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        descriptions = [item['description'] for item in results]

        self.assertIn('Report for admin list', descriptions)

    def test_regular_user_cannot_change_report_status_directly(self):
        report = ContentReport.objects.create(
            reporter=self.other_user,
            content_object=self.post,
            reason='insult',
            description='Report status test'
        )

        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            f'/reports/{report.id}/',
            {
                'status': 'resolved',
                'moderator_comment': 'Trying to resolve manually'
            },
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_405_METHOD_NOT_ALLOWED,
                status.HTTP_200_OK
            ]
        )

        report.refresh_from_db()

        self.assertNotEqual(report.status, 'resolved')
        self.assertNotEqual(
            report.moderator_comment,
            'Trying to resolve manually'
        )