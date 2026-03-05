from django.urls import path
from .views import (
    ActivityListView, 
    ActivityDetailView, 
    ActivityCreateView,
    ActivityUpdateView,
    ActivityUploadFileView,
    ActivityImportFileView,
    ActivityDetachFileView
)


urlpatterns = [
    path('', ActivityListView.as_view(), name='activity-list'),
    path('create/', ActivityCreateView.as_view(), name='activity-create'),
    path('<str:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('update/<str:pk>/', ActivityUpdateView.as_view(), name='activity-update'),
    path('upload-file/<str:pk>/', ActivityUploadFileView.as_view(), name='activity-upload-file'),
    path('import-file/<str:pk>/', ActivityImportFileView.as_view(), name='activity-import-file'),
    path('detach-file/<str:pk>/', ActivityDetachFileView.as_view(), name='activity-detach-file'),
]