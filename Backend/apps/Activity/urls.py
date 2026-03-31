from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    ListActivitySubmissionsGroupedView,
    ActivityStudentSubmissionDetailView,
    ActivityReturnToStudentReviewView
)
from apps.Question.views import (ListActivityQuestionsView, ListActivityQuestionsWithResponseView)
from ssa.urls import ACTIVITY_API_PREFIX as DEFAULT_API_PREFIX

activity_router = DefaultRouter()
activity_router.register(r'{}'.format(DEFAULT_API_PREFIX), ActivityViewSet, basename='activity') 

urlpatterns = [
    path('', include(activity_router.urls)),
    path(f'{DEFAULT_API_PREFIX}/<str:pk>/questions/', ListActivityQuestionsView.as_view(), name='activity-questions'),
    path(f'{DEFAULT_API_PREFIX}/<str:pk>/questions/response/', ListActivityQuestionsWithResponseView.as_view(), name='activity-questions-response'),
    path(f'{DEFAULT_API_PREFIX}/<str:pk>/submissions/grouped/', ListActivitySubmissionsGroupedView.as_view(), name='activity-submissions-grouped'),
    path(f'{DEFAULT_API_PREFIX}/<str:pk>/student/<str:student_id>/submissions/', ActivityStudentSubmissionDetailView.as_view(), name='activity-student-submissions'),
    path(f'{DEFAULT_API_PREFIX}/<str:pk>/student/<str:student_id>/submit-review/', ActivityReturnToStudentReviewView.as_view(), name='activity-submit-review'),
]