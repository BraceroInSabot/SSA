from typing import Dict, Any
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from apps.AuthUser.models import AuthUser
from rest_framework_simplejwt.tokens import RefreshToken

class AuthenticationTests(APITestCase):
    """
    Ensures the integrity of JWT credential issuance and revocation cycles.
    """

    def setUp(self) -> None:
        self.user: AuthUser = AuthUser.objects.create_user(
            email="test@school.com",
            name="Test Student",
            password="strong_password_123"
        )
        self.login_url: str = reverse('login')
        self.logout_url: str = reverse('logout')

    def test_login_with_valid_credentials(self) -> None:
        payload: Dict[str, str] = {
            "email": "test@school.com",
            "password": "strong_password_123"
        }
        response: Response = self.client.post(self.login_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_with_invalid_password(self) -> None:
        payload: Dict[str, str] = {
            "email": "test@school.com",
            "password": "wrong_password"
        }
        response: Response = self.client.post(self.login_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)

    def test_logout_with_valid_token(self) -> None:
        refresh: RefreshToken = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        payload: Dict[str, str] = {"refresh": str(refresh)}
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_without_refresh_token(self) -> None:
        refresh: RefreshToken = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        payload: Dict[str, Any] = {} 
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)