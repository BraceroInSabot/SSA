from django.db.models.query import QuerySet

from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, ListModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny

from ..core.permissions import IsTeacher
from .models import Course
from .serializer import CourseSerializer

class CourseViewSet(
    CreateModelMixin,
    RetrieveModelMixin,
    ListModelMixin,
    GenericViewSet
):
    """
    Unified REST controller for the Course resource.
    Exposes List (GET), Retrieve (GET /<pk>/), and Create (POST) operations.
    """
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions required for the specific action.
        - Public access for reading actions.
        - Restricted access (Teacher only) for writing/mutating actions.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsTeacher]
            
        return [permission() for permission in permission_classes]

    def get_queryset(self) -> QuerySet[Course]:
        """
        Enforces consistent data exposure across all HTTP actions, preventing IDOR vulnerabilities on inactive courses.
        """
        return Course.objects.filter(is_active=True)
        