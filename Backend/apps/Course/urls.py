from django.urls import path
from .views import CourseListView, CourseDetailView, CourseCreateView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('create/', CourseCreateView.as_view(), name='course-create'),
    path('<str:pk>/', CourseDetailView.as_view(), name='course-detail'),
    # path('update/<str:pk>/', CourseDetailView.as_view(), name='course-update'),
    # path('deactivate/<str:pk>/', CourseDetailView.as_view(), name='course-deactivate'),
]