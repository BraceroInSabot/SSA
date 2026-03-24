from typing import Dict, Any
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from apps.AuthUser.models import AuthUser
from rest_framework_simplejwt.tokens import RefreshToken

class LogoutViewTests(APITestCase):
    """
    Validates the session termination process and token blacklisting mechanics.
    """

    def setUp(self) -> None:
        self.user: AuthUser = AuthUser.objects.create_user(
            email="test@school.com",
            name="Test Student",
            password="strong_password_123"
        )
        self.logout_url: str = reverse('logout')
        
        self.refresh_token: RefreshToken = RefreshToken.for_user(self.user)
        self.access_token: str = str(self.refresh_token.access_token)

    def test_logout_success_with_valid_token(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        payload: Dict[str, str] = {"refresh": str(self.refresh_token)}
        
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_failure_missing_refresh_parameter(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        payload: Dict[str, Any] = {}
        
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("O parâmetro 'refresh' é obrigatório", response.data['detail'])

    def test_logout_failure_invalid_or_blacklisted_token(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        payload: Dict[str, str] = {"refresh": "fake_or_corrupted_token_string"}
        
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Token inválido, corrompido ou já expirado", response.data['detail'])

    def test_logout_failure_unauthenticated_user(self) -> None:
        self.client.credentials() 
        payload: Dict[str, str] = {"refresh": str(self.refresh_token)}
        
        response: Response = self.client.post(self.logout_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)