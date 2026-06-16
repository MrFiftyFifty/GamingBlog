from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from some_app.models import PrivateMessage


User = get_user_model()


class PrivateMessagesAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='message_user',
            email='message_user@example.com',
            password='TestPassword123'
        )

        self.other_user = User.objects.create_user(
            username='message_other_user',
            email='message_other_user@example.com',
            password='TestPassword123'
        )

        self.third_user = User.objects.create_user(
            username='message_third_user',
            email='message_third_user@example.com',
            password='TestPassword123'
        )

        self.fourth_user = User.objects.create_user(
            username='message_fourth_user',
            email='message_fourth_user@example.com',
            password='TestPassword123'
        )

        self.sent_message = PrivateMessage.objects.create(
            sender=self.user,
            recipient=self.other_user,
            content='Message from user to other user'
        )

        self.received_message = PrivateMessage.objects.create(
            sender=self.other_user,
            recipient=self.user,
            content='Message from other user to user'
        )

        self.foreign_message = PrivateMessage.objects.create(
            sender=self.third_user,
            recipient=self.fourth_user,
            content='Foreign private message'
        )

    def get_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']

        return response.data

    def test_anonymous_user_cannot_list_private_messages(self):
        response = self.client.get('/private-messages/')

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN
            ]
        )

    def test_anonymous_user_cannot_send_private_message(self):
        payload = {
            'recipient_id': self.other_user.id,
            'content': 'Anonymous private message'
        }

        response = self.client.post(
            '/private-messages/',
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
            PrivateMessage.objects.filter(
                content='Anonymous private message'
            ).exists()
        )

    def test_authenticated_user_can_send_private_message(self):
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
        self.assertEqual(response.data['sender'], self.user.id)
        self.assertEqual(response.data['recipient_username'], self.other_user.username)
        self.assertTrue(response.data['is_mine'])

        message = PrivateMessage.objects.get(id=response.data['id'])
        self.assertEqual(message.sender, self.user)
        self.assertEqual(message.recipient, self.other_user)
        self.assertEqual(message.content, 'Hello private message')

    def test_list_returns_only_current_user_private_messages(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/private-messages/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)
        contents = [item['content'] for item in results]

        self.assertIn(self.sent_message.content, contents)
        self.assertIn(self.received_message.content, contents)
        self.assertNotIn(self.foreign_message.content, contents)

    def test_user_can_retrieve_own_sent_message(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f'/private-messages/{self.sent_message.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.sent_message.id)
        self.assertEqual(response.data['content'], self.sent_message.content)
        self.assertTrue(response.data['is_mine'])

    def test_user_can_retrieve_own_received_message(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f'/private-messages/{self.received_message.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.received_message.id)
        self.assertEqual(response.data['content'], self.received_message.content)
        self.assertFalse(response.data['is_mine'])

    def test_user_cannot_retrieve_foreign_private_message(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f'/private-messages/{self.foreign_message.id}/'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_send_message_as_another_sender(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            'sender': self.other_user.id,
            'recipient_id': self.other_user.id,
            'content': 'Trying to spoof sender'
        }

        response = self.client.post(
            '/private-messages/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        message = PrivateMessage.objects.get(id=response.data['id'])
        self.assertEqual(message.sender, self.user)
        self.assertNotEqual(message.sender, self.other_user)

    def test_user_cannot_change_read_status_directly_if_field_is_read_only(self):
        self.client.force_authenticate(user=self.user)

        self.assertFalse(self.received_message.is_read)

        response = self.client.patch(
            f'/private-messages/{self.received_message.id}/',
            {
                'is_read': True
            },
            format='json'
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_403_FORBIDDEN,
                status.HTTP_405_METHOD_NOT_ALLOWED
            ]
        )

        self.received_message.refresh_from_db()

        if response.status_code == status.HTTP_200_OK:
            self.assertFalse(self.received_message.is_read)

    def test_private_message_with_unknown_recipient_returns_400(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            'recipient_id': 999999,
            'content': 'Message to unknown user'
        }

        response = self.client.post(
            '/private-messages/',
            payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertFalse(
            PrivateMessage.objects.filter(
                content='Message to unknown user'
            ).exists()
        )