from typing import Dict, Any
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.AuthUser.models import AuthUser
from apps.Course.models import Course
from apps.Activity.models import Activity
from apps.Question.models import Question

class ActivityViewSetTests(APITestCase):
    """
    Validates the core CRUD operations, permission barriers, and business logic for Activities.
    """

    def setUp(self) -> None:
        self.teacher: AuthUser = AuthUser.objects.create_user(
            email="teacher@school.com", name="Teacher", password="123"
        )
        self.teacher.is_teacher = True
        self.teacher.save()

        self.student: AuthUser = AuthUser.objects.create_user(
            email="student@school.com", name="Student", password="123"
        )
        self.student.is_student = True
        self.student.save()

        self.course: Course = Course.objects.create(
            course_name="Software Engineering", 
            is_active=True, 
            course_year=2026
        )
        
        self.activity: Activity = Activity.objects.create(
            course=self.course,
            name="Design Patterns Test",
            description="Complete GOF patterns evaluation.",
            activity_type=Activity.ActivityType.TST,
            to_be_launched=timezone.now() + timezone.timedelta(days=7),
            due_date=timezone.now() + timezone.timedelta(days=14),
            total_grade=10.0,
            status=Activity.ActivityStatus.DRAFT
        )
        
        self.list_url: str = reverse('activity-list')
        self.publish_url: str = reverse('activity-publish', kwargs={'pk': self.activity.pk})

    def test_student_cannot_create_activity(self) -> None:
        self.client.force_authenticate(user=self.student)
        
        payload: Dict[str, Any] = {
            "name": "Hacked Activity", 
            "description": "Student trying to bypass the system.",
            "course": self.course.pk,
            "total_grade": 10.0,
            "to_be_launched": (timezone.now() + timezone.timedelta(days=1)).isoformat(),
            "due_date": (timezone.now() + timezone.timedelta(days=5)).isoformat()
        }
        
        response: Response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_publish_activity_without_questions_fails(self) -> None:
        self.client.force_authenticate(user=self.teacher)
        
        response: Response = self.client.patch(self.publish_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("without questions", response.data['detail'])

    def test_publish_activity_with_wrong_weights_fails(self) -> None:
        self.client.force_authenticate(user=self.teacher)
        
        question: Question = Question.objects.create(
            question_description="Q1", 
            question_expected_result=5.0,
            question_type=Question.QuestionType.SHORT_ANSWER
        )
        question.activity.add(self.activity)
        
        response: Response = self.client.patch(self.publish_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("differs from the total grade", response.data['detail'])

    def test_publish_activity_success(self) -> None:
        self.client.force_authenticate(user=self.teacher)
        
        question: Question = Question.objects.create(
            question_description="Q1", 
            question_expected_result=10.0,
            question_type=Question.QuestionType.SHORT_ANSWER
        )
        
        question.activity.add(self.activity)
        
        response: Response = self.client.patch(self.publish_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.activity.refresh_from_db()
        self.assertEqual(self.activity.status, Activity.ActivityStatus.PUBLISHED)
        