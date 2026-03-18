from django.urls import path
from .views import (
    ActivityListView, 
    ActivityDetailView, 
    ActivityCreateView,
    ActivityUpdateView,
    ActivityUploadFileView,
    ActivityImportFileView,
    ActivityDetachFileView,
    ActivityPublishView,
    ActivitySubmitView,
    ActivityListSubmissionsView,
    ActivityStudentSubmissionDetailView,
    ActivityReturnToStudentReviewView
)
from apps.Question.views import (ListActivityQuestionsView, ListActivityQuestionsWithResponseView)


urlpatterns = [
    path('', ActivityListView.as_view(), name='activity-list'),
    path('create/', ActivityCreateView.as_view(), name='activity-create'),
    path('<str:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('<str:pk>/publish/', ActivityPublishView.as_view(), name='activity-publish'),
    path('upload-file/<str:pk>/', ActivityUploadFileView.as_view(), name='activity-upload-file'),
    path('import-file/<str:pk>/', ActivityImportFileView.as_view(), name='activity-import-file'),
    path('detach-file/<str:pk>/', ActivityDetachFileView.as_view(), name='activity-detach-file'),
    path('<str:pk>/questions/', ListActivityQuestionsView.as_view(), name='activity-questions'),
    path('<str:pk>/questions/response/', ListActivityQuestionsWithResponseView.as_view(), name='activity-questions-response'),
]

urlpatterns += [
    path('<str:pk>/submit/', ActivitySubmitView.as_view(), name='activity-submit'),
    path('<str:pk>/submissions/grouped/', ActivityListSubmissionsView.as_view(), name='activity-submissions-grouped'),
    path('<str:pk>/student/<str:student_id>/submissions/', ActivityStudentSubmissionDetailView.as_view(), name='activity-student-submissions'),
    path('<str:pk>/student/<str:student_id>/submit-review/', ActivityReturnToStudentReviewView.as_view(), name='activity-submit-review'),
]