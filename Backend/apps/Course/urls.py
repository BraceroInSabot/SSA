from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, BimestreViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'bimestres', BimestreViewSet, basename='bimestre')

urlpatterns = [
    path('', include(router.urls)),
]