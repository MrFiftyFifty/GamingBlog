import os
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import Upload


User = get_user_model()

TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class UploadsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='upload_user',
            email='upload_user@example.com',
            password='TestPassword123'
        )

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()

        if os.path.exists(TEMP_MEDIA_ROOT):
            shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def create_test_file(self, name, content, content_type):
        return SimpleUploadedFile(
            name=name,
            content=content,
            content_type=content_type
        )

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def assert_upload_response_has_file_url(self, response, filename):
        self.assertIn('url', response.data)
        self.assertIn(filename, response.data['url'])

    def test_anonymous_user_cannot_upload_file(self):
        file = self.create_test_file(
            name='test.png',
            content=b'\x89PNG\r\n\x1a\n',
            content_type='image/png'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

        self.assertEqual(Upload.objects.count(), 0)

    def test_authenticated_user_can_upload_png(self):
        self.client.force_authenticate(user=self.user)

        file = self.create_test_file(
            name='test.png',
            content=b'\x89PNG\r\n\x1a\n',
            content_type='image/png'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assert_upload_response_has_file_url(response, 'test.png')
        self.assertEqual(Upload.objects.count(), 1)

        upload = Upload.objects.first()
        self.assertEqual(upload.uploaded_by, self.user)

    def test_authenticated_user_can_upload_jpg(self):
        self.client.force_authenticate(user=self.user)

        file = self.create_test_file(
            name='test.jpg',
            content=b'\xff\xd8\xff\xe0' + b'jpg-test-content',
            content_type='image/jpeg'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assert_upload_response_has_file_url(response, 'test.jpg')
        self.assertEqual(Upload.objects.count(), 1)

        upload = Upload.objects.first()
        self.assertEqual(upload.uploaded_by, self.user)

    def test_authenticated_user_can_upload_gif(self):
        self.client.force_authenticate(user=self.user)

        file = self.create_test_file(
            name='test.gif',
            content=b'GIF89a' + b'gif-test-content',
            content_type='image/gif'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assert_upload_response_has_file_url(response, 'test.gif')
        self.assertEqual(Upload.objects.count(), 1)

        upload = Upload.objects.first()
        self.assertEqual(upload.uploaded_by, self.user)

    def test_txt_file_is_rejected(self):
        self.client.force_authenticate(user=self.user)

        file = self.create_test_file(
            name='test.txt',
            content=b'This is not an image',
            content_type='text/plain'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Upload.objects.count(), 0)

    def test_file_larger_than_10mb_is_rejected(self):
        self.client.force_authenticate(user=self.user)

        file = self.create_test_file(
            name='big.png',
            content=b'a' * (10 * 1024 * 1024 + 1),
            content_type='image/png'
        )

        response = self.client.post(
            '/upload/',
            {
                'file': file
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Upload.objects.count(), 0)

    def test_upload_list_is_available_for_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        Upload.objects.create(
            uploaded_by=self.user,
            file=self.create_test_file(
                name='existing.png',
                content=b'\x89PNG\r\n\x1a\n',
                content_type='image/png'
            )
        )

        response = self.client.get('/upload/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 1)

        self.assertTrue(
            'file' in results[0] or 'url' in results[0]
        )