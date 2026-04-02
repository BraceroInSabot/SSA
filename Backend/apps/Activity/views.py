from django.db.models.query import QuerySet
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, ListModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import APIView, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import CreateAPIView, ListAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db import transaction

from apps.Activity.models import Activity, Activity_Submission
from apps.Course.models import Course
from .serializer import ActivitySerializer, ActivityFileSerializer, ActivitySubmissionDetailSerializer, ActivityReturnForStudentReviewSerializer, ActivitySubmitSerializer
from ..core.permissions import IsTeacher
from apps.Question.models import Question
from apps.Question.serializer import QuestionsSerializer
from ssa.urls import ACTIVITY_API_PREFIX as DEFAULT_API_PREFIX

class ActivityViewSet(
    CreateModelMixin,
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    GenericViewSet
):
    """
    Unified REST controller for the Activity resource and its sub-actions.
    """
    serializer_class = ActivitySerializer
    
    def get_permissions(self):
        """
        Action-based permission routing.
        """
        if self.action in ['list', 'retrieve', 'submit']:
            return [AllowAny()]
        
        return [IsAuthenticated(), IsTeacher()]
    
    def get_queryset(self) -> QuerySet[Activity]:
        user = self.request.user
        queryset = Activity.objects.none()
        
        if getattr(user, 'is_teacher', False):
            queryset = Activity.objects.all()
        elif getattr(user, 'is_student', False) or user.is_anonymous:
            queryset = Activity.objects.filter(status=Activity.ActivityStatus.PUBLISHED)
        else:
            return queryset
            
        course_id = self.request.query_params.get('course_id') # type: ignore
        if course_id:
            target_course = get_object_or_404(Course, pk=course_id, is_active=True)
            return queryset.filter(course=target_course)
            
        return queryset

    # --- SATELLITE ACTIONS CONSOLIDATED ---

    @action(detail=True, methods=['patch'], url_path='publish')
    def publish(self, request, pk=None) -> Response:
        """
        Transitions the activity from DRAFT to PUBLISHED.
        Route automatically generated: PATCH /activities/{pk}/publish/
        """
        activity: Activity = self.get_object()

        if activity.status == Activity.ActivityStatus.PUBLISHED:
            raise ValidationError({"detail": "This activity is already published."})

        if activity.activity_type == Activity.ActivityType.TST:
            if not activity.questions.exists(): 
                raise ValidationError({"detail": "A test cannot be published without questions."})
            
            total_pesos = activity.questions.aggregate(
                total=Sum('question_expected_result')
            )['total'] or 0
            
            if total_pesos != activity.total_grade:
                 raise ValidationError({
                    "detail": f"The sum of question weights ({total_pesos}) differs from the total grade ({activity.total_grade})."
                })

        activity.status = Activity.ActivityStatus.PUBLISHED
        activity.save()

        return Response({
            "detail": "Activity published successfully.", 
            "status": activity.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='upload-file', parser_classes=[MultiPartParser, FormParser])
    def upload_file(self, request, pk=None) -> Response:
        """
        Handles file attachments for a specific activity.
        Route automatically generated: POST /activities/{pk}/upload-file/
        """
        activity = self.get_object()
        serializer = ActivityFileSerializer(data=request.data, context={'activity': activity})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None) -> Response:
        """
        Submits answers for a specific activity.
        Route automatically generated: POST /activities/{pk}/submit/
        """
        activity = self.get_object()
        serializer = ActivitySubmitSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Activity submitted successfully."}, status=status.HTTP_200_OK)

class ListActivityQuestionsView(ListModelMixin, GenericViewSet):
    """
    Returns the list of questions associated with a specific activity.
    """
    serializer_class = QuestionsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        activity_id = self.kwargs.get('pk')
        return Question.objects.filter(activity=activity_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class ListActivitySubmissionsGroupedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        Returns a list of submissions for a specific activity, grouped by student.
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
                    "submissions": f"{DEFAULT_API_PREFIX}/{pk}/student/{student_id}/submissions/"
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
    