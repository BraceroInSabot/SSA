from typing import Dict, Any
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from apps.AuthUser.models import AuthUser
from rest_framework_simplejwt.tokens import RefreshToken

class UserUpdateViewTests(APITestCase):
    """
    Validates profile updates and the security constraints of password modifications.
    """

    def setUp(self) -> None:
        self.user: AuthUser = AuthUser.objects.create_user(
            email="student@school.com",
            name="Test Student",
            password="old_password_123"
        )
        self.url: str = reverse('user-update')
        
        self.refresh_token: RefreshToken = RefreshToken.for_user(self.user)
        self.access_token: str = str(self.refresh_token.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_update_email_only_success(self) -> None:
        payload: Dict[str, str] = {"email": "new_email@school.com"}
        
        response: Response = self.client.patch(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "new_email@school.com")
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "new_email@school.com")

    def test_update_password_success(self) -> None:
        payload: Dict[str, str] = {
            "current_password": "old_password_123",
            "new_password": "NewStrongPassword456!"
        }
        
        response: Response = self.client.patch(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPassword456!"))

    def test_update_password_missing_current(self) -> None:
        payload: Dict[str, str] = {"new_password": "NewStrongPassword456!"}
        
        response: Response = self.client.patch(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', response.data)

    def test_update_password_wrong_current(self) -> None:
        payload: Dict[str, str] = {
            "current_password": "wrong_old_password",
            "new_password": "NewStrongPassword456!"
        }
        
        response: Response = self.client.patch(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', response.data)

    def test_unauthenticated_access_denied(self) -> None:
        self.client.credentials() 
        response: Response = self.client.patch(self.url, {})
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)