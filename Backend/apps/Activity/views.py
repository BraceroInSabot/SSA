from django.shortcuts import render
from apps.Activity.models import Activity
from apps.Course.models import Course
from apps.Activity.serializer import ActivitySerializer
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from django.shortcuts import get_object_or_404


class ActivityListView(ListAPIView):
    serializer_class = ActivitySerializer
    
    def get_queryset(self):
        queryset = Activity.objects.filter(is_active=True)
        course_id = self.request.query_params.get('course_id') # type: ignore
        
        if course_id:
            target_course = get_object_or_404(Course, pk=course_id, is_active=True)
            return queryset.filter(course=target_course)
            
        return queryset.none()

class ActivityDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    lookup_field = 'pk'

class ActivityCreateView(CreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

class ActivityUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    lookup_field = 'pk'
