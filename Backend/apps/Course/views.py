from django.db.models.query import QuerySet

from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, ListModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from ..core.permissions import IsTeacher
from .models import Course, Bimestre
from .serializer import CourseSerializer, BimestreSerializer

class BimestreViewSet(ModelViewSet):
    """
    Unified REST controller for the Bimestre resource.
    Exposes Full CRUD operations.
    """
    serializer_class = BimestreSerializer
    queryset = Bimestre.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsTeacher]
        return [permission() for permission in permission_classes]

class CourseViewSet(
    CreateModelMixin,
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    DestroyModelMixin,
    GenericViewSet
):
    """
    Unified REST controller for the Course resource.
    Exposes List (GET), Retrieve (GET /<pk>/), Create (POST), Update (PUT/PATCH), and Destroy (DELETE) operations.
    """
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions required for the specific action.
        - Public access for reading actions.
        - Restricted access (Teacher only) for writing/mutating actions.
        """
        if self.action in ['list', 'retrieve', 'analytics']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsTeacher]
            
        return [permission() for permission in permission_classes]

    def get_queryset(self) -> QuerySet[Course]:
        """
        Enforces consistent data exposure across all HTTP actions, preventing IDOR vulnerabilities on inactive courses.
        If the user is a teacher, we might allow them to see all courses (including inactive). 
        For now, we just return all if it's the teacher or if they request a specific one to delete/deactivate, 
        but let's keep the is_active=True filter for lists, except teachers can see all.
        """
        if self.request and hasattr(self.request.user, 'is_teacher') and self.request.user.is_teacher:
            return Course.objects.all()
        return Course.objects.filter(is_active=True)
        
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Returns the analytics dashboard data for the course.
        """
        if self.request.user.is_authenticated and hasattr(self.request.user, 'is_teacher') and self.request.user.is_teacher:
            course = self.get_object()
            data = course.analytics()
            return Response(data)
        