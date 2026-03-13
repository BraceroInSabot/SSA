from django.shortcuts import render
from apps.Activity.models import Activity, Activity_Attached_Files
from apps.Course.models import Course
from apps.Activity.serializer import ActivitySerializer, ActivityFileSerializer
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from apps.Activity.models import Activity

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
    
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class ActivityUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    lookup_field = 'pk'

class ActivityUploadFileView(CreateAPIView):
    queryset = Activity_Attached_Files.objects.all()
    serializer_class = ActivityFileSerializer
    parser_classes = [MultiPartParser, FormParser]
    
class ActivityImportFileView(CreateAPIView):
    queryset = Activity_Attached_Files.objects.all()
    serializer_class = ActivityFileSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'pk'
    
class ActivityDetachFileView(RetrieveUpdateDestroyAPIView):
    queryset = Activity_Attached_Files.objects.all()
    serializer_class = ActivityFileSerializer
    lookup_field = 'pk'
    
class ActivityPublishView(APIView):
    def patch(self, request, pk, *args, **kwargs):
        """
        Transita a atividade de DRAFT para PUBLISHED garantindo a integridade dos dados.
        """
        activity = get_object_or_404(Activity, pk=pk)

        if activity.status == Activity.ActivityStatus.PUBLISHED:
            raise ValidationError({"detail": "Esta atividade já encontra-se publicada."})

        if activity.activity_type == Activity.ActivityType.TST:
            if not activity.questions.exists():
                raise ValidationError({"detail": "Um teste não pode ser publicado sem questões."})
            
            total_pesos = activity.questions.aggregate(Sum('question_expected_result'))['question_expected_result__sum'] or 0
            if total_pesos != activity.total_grade:
                 raise ValidationError({
                    "detail": f"A soma dos pesos das questões ({total_pesos}) difere da nota total ({activity.total_grade})."
                })

        activity.status = Activity.ActivityStatus.PUBLISHED
        activity.save()

        return Response({
            "detail": "Atividade publicada.", 
            "status": activity.status
        }, status=status.HTTP_200_OK)