from django.shortcuts import render
from .models import Activity, Activity_Attached_Files, Activity_Submission
from apps.Course.models import Course
from .serializer import (
    ActivitySerializer, 
    ActivityFileSerializer, 
    ActivitySubmitSerializer, 
    ActivityDetailSerializer, 
    ActivityListSubmissions,
    ActivitySubmissionDetailSerializer,
    ActivityReturnForStudentReviewSerializer
)
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView, UpdateAPIView
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from apps.Activity.models import Activity
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

class ActivityListView(ListAPIView):
    serializer_class = ActivitySerializer
    
    def get_queryset(self):
        user = self.request.user
        
        queryset = Activity.objects.filter(status=Activity.ActivityStatus.PUBLISHED)
        
        if user.is_teacher: # type: ignore
            queryset = Activity.objects.all()
            
        course_id = self.request.query_params.get('course_id')  # type: ignore
        
        if course_id:
            target_course = get_object_or_404(Course, pk=course_id, is_active=True)
            return queryset.filter(course=target_course)
            
        return queryset.none()

class ActivityDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivityDetailSerializer
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
            if not activity.questions.exists(): # type: ignore
                raise ValidationError({"detail": "Um teste não pode ser publicado sem questões."})
            
            total_pesos = activity.questions.aggregate(Sum('question_expected_result'))['question_expected_result__sum'] or 0 # type: ignore
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
        
class ActivitySubmitView(CreateAPIView):
    queryset = Activity_Submission.objects.all()
    serializer_class = ActivitySubmitSerializer
    lookup_field = 'pk'
    
class ActivityListSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        Garante que apenas professores possam acessar os dados.
        Retorna as submissões agrupadas por aluno em O(n) com uma única query no banco.
        """
        if not getattr(request.user, 'is_teacher', False):
            return Response({"detail": "Acesso negado."}, status=403)

        submissions = Activity_Submission.objects.filter(
            activity_id=pk
        ).select_related('student', 'submission_question')

        grouped_data = {}

        for sub in submissions:
            student_id = str(sub.student.pk)
            
            if student_id not in grouped_data:
                grouped_data[student_id] = {
                    "student_id": student_id,
                    "student_name": sub.student.name, # type: ignore
                    "submitted_at": sub.submitted_at.isoformat(),
                    "submissions": f"activity/{pk}/student/{student_id}/submissions/"
                }

        return Response(list(grouped_data.values()))
    
class ActivityStudentSubmissionDetailView(ListAPIView):
    serializer_class = ActivitySubmissionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        activity_id = self.kwargs.get('pk')
        student_id = self.kwargs.get('student_id')
        
        return Activity_Submission.objects.filter(
            activity_id=activity_id, 
            student_id=student_id
        ).select_related('submission_question')

class ActivityReturnToStudentReviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk, student_id):
        """
        Recebe um payload no formato:
        {
            "evaluations": [
                {"submission_id": "uuid", "submission_grade": 10, "teacher_feedback": "..."}
            ]
        }
        """
        if not getattr(request.user, 'is_teacher', False):
            return Response({"detail": "Acesso negado. Apenas professores podem avaliar."}, status=403)

        evaluations_data = request.data.get('evaluations')
        
        if not evaluations_data or not isinstance(evaluations_data, list):
            raise ValidationError({"evaluations": "O payload deve conter uma lista de avaliações sob a chave 'evaluations'."})

        serializer = ActivityReturnForStudentReviewSerializer(data=evaluations_data, many=True)
        serializer.is_valid(raise_exception=True)
        
        valid_data = serializer.validated_data
        submissions_to_update = []
        
        with transaction.atomic():
            for item in valid_data: # type: ignore
                sub_id = item['submission_id']
                
                try:
                    submission = Activity_Submission.objects.get(
                        submission_id=sub_id,
                        activity_id=pk,
                        student_id=student_id
                    )
                    
                    submission.submission_grade = item.get('submission_grade', submission.submission_grade)
                    submission.teacher_feedback = item.get('teacher_feedback', submission.teacher_feedback)
                    submission.has_teacher_revision = True
                    submissions_to_update.append(submission)
                    
                except Activity_Submission.DoesNotExist:
                    raise ValidationError(f"A submissão com ID {sub_id} não existe, não pertence a este aluno ou a esta atividade.")
            
            if submissions_to_update:
                Activity_Submission.objects.bulk_update(
                    submissions_to_update, 
                    ['submission_grade', 'teacher_feedback', 'has_teacher_revision']
                )

        return Response({"detail": "Avaliações salvas com sucesso."}, status=200)
    