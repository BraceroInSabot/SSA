from typing import Dict, Any
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from apps.AuthUser.models import AuthUser
from rest_framework_simplejwt.tokens import RefreshToken

class UserInfoViewTests(APITestCase):
    """
    Validates the retrieval of authenticated user profile data and permission barriers.
    """

    def setUp(self) -> None:
        self.user: AuthUser = AuthUser.objects.create_user(
            email="student@school.com",
            name="Test Student",
            password="strong_password_123"
        )
        self.url: str = reverse('user-info')
        
        self.refresh_token: RefreshToken = RefreshToken.for_user(self.user)
        self.access_token: str = str(self.refresh_token.access_token)

    def test_retrieve_user_info_authenticated(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response: Response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['name'], self.user.name)
        self.assertTrue(response.data['is_student'])
        self.assertFalse(response.data['is_teacher'])
        self.assertIn('image', response.data)

    def test_retrieve_user_info_unauthenticated(self) -> None:
        self.client.credentials() 
        
        response: Response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)