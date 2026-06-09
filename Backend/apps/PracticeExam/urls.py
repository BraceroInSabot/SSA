from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CampaignGroupViewSet, PracticeExamViewSet, 
    PracticeExamSubmissionViewSet, AntiCheatLogViewSet
)

router = DefaultRouter()
router.register(r'campaigns', CampaignGroupViewSet, basename='campaign')
router.register(r'practice-exams', PracticeExamViewSet, basename='practiceexam')
router.register(r'practice-exam-submissions', PracticeExamSubmissionViewSet, basename='practiceexamsubmission')
router.register(r'anti-cheat-logs', AntiCheatLogViewSet, basename='anticheatlog')

urlpatterns = [
    path('', include(router.urls)),
]