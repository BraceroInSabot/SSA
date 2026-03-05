from django.shortcuts import render
from apps.Course.models import Course
from apps.Course.serializer import CourseSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView

class CourseListView(ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer

class CourseDetailView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'pk'

class CourseCreateView(CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer