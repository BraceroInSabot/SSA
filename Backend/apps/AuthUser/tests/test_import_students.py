import io
from typing import Dict, Any
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from apps.AuthUser.models import AuthUser
from rest_framework_simplejwt.tokens import RefreshToken

class StudentImportViewTests(APITestCase):
    """
    Validates the CSV processing, permission enforcement, and business rules for bulk student creation.
    """

    def setUp(self) -> None:
        self.teacher: AuthUser = AuthUser.objects.create_user(
            email="teacher@school.com",
            name="Test Teacher",
            password="strong_password_123"
        )
        self.teacher.is_teacher = True
        self.teacher.is_student = False
        self.teacher.save()

        self.student: AuthUser = AuthUser.objects.create_user(
            email="student@school.com",
            name="Intruder Student",
            password="strong_password_123"
        )
        
        self.url: str = reverse('student-import')
        self.refresh_token: RefreshToken = RefreshToken.for_user(self.teacher)
        self.access_token: str = str(self.refresh_token.access_token)

    def test_import_unauthenticated_or_student_denied(self) -> None:
        student_refresh: RefreshToken = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_refresh.access_token}')
        
        csv_content: bytes = b"Nome Completo;RA\nJoao Silva;123456"
        csv_file: SimpleUploadedFile = SimpleUploadedFile("test.csv", csv_content, content_type="text/csv")
        
        response: Response = self.client.post(self.url, {"file": csv_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_import_invalid_file_format(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        txt_file: SimpleUploadedFile = SimpleUploadedFile("test.txt", b"Invalid text", content_type="text/plain")
        response: Response = self.client.post(self.url, {"file": txt_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_import_missing_required_headers(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        csv_content: bytes = b"Nome;Documento\nJoao Silva;123456"
        csv_file: SimpleUploadedFile = SimpleUploadedFile("test.csv", csv_content, content_type="text/csv")
        
        response: Response = self.client.post(self.url, {"file": csv_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cabe\u00e7alhos inv\u00e1lidos", response.data["error"])

    def test_import_successful_clean_batch(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        csv_content: bytes = b"Nome Completo;RA\nCarlos Oliveira;987654\nAna Souza;654321"
        csv_file: SimpleUploadedFile = SimpleUploadedFile("clean.csv", csv_content, content_type="text/csv")
        
        response: Response = self.client.post(self.url, {"file": csv_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["criados"], 2)
        
        self.assertTrue(AuthUser.objects.filter(email="987654sp@aluno.educacao.sp.gov.br").exists())
        self.assertTrue(AuthUser.objects.filter(email="654321sp@aluno.educacao.sp.gov.br").exists())

    def test_import_partial_success_multi_status(self) -> None:
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Pre-create a user to force a duplicate error
        AuthUser.objects.create_user(
            email="111111sp@aluno.educacao.sp.gov.br",
            name="Existing User",
            password="123"
        )
        
        # Row 1: Valid
        # Row 2: Duplicate RA/Email
        # Row 3: RA too short
        csv_content: bytes = (
            b"Nome Completo;RA\n"
            b"Marcos Santos;222222\n"
            b"Usuario Duplicado;111111\n"
            b"RA Invalido;12\n"
        )
        csv_file: SimpleUploadedFile = SimpleUploadedFile("mixed.csv", csv_content, content_type="text/csv")
        
        response: Response = self.client.post(self.url, {"file": csv_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)
        self.assertEqual(response.data["criados"], 1)
        self.assertEqual(len(response.data["avisos"]), 2)