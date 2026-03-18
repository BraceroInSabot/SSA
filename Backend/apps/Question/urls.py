from django.urls import path
from .views import (QuestionCreateView, QuestionDetailView, QuestionUpdateView, QuestionDeleteView)

# For Questions
urlpatterns = [
    path('create/', QuestionCreateView.as_view(), name='question-create'),
    path('<str:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('update/<str:pk>/', QuestionUpdateView.as_view(), name='question-update'),
    path('delete/<str:pk>/', QuestionDeleteView.as_view(), name='question-delete'),
]