from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import CampaignGroup, CampaignRanking, PracticeExam, PracticeExam_Submission, AntiCheatLog
from .serializer import (
    CampaignGroupSerializer, CampaignRankingSerializer, PracticeExamSerializer,
    PracticeExamSubmissionSerializer, AntiCheatLogSerializer
)
from apps.core.permissions import IsTeacher
from apps.Question.models import Question

class CampaignGroupViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'is_teacher', False):
            return CampaignGroup.objects.all()
        return CampaignGroup.objects.filter(is_active=True, rankings__student=user).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def join(self, request):
        access_code = request.data.get('access_code')
        if not access_code:
            return Response({'error': 'Access code required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            campaign = CampaignGroup.objects.get(access_code=access_code, is_active=True)
        except CampaignGroup.DoesNotExist:
            return Response({'error': 'Invalid or inactive access code'}, status=status.HTTP_404_NOT_FOUND)
        
        from .models import CampaignRanking
        # Create a ranking entry to register the student in the campaign
        ranking, created = CampaignRanking.objects.get_or_create(campaign=campaign, student=request.user)
        if created:
            return Response({'status': 'Joined campaign successfully', 'campaign_id': campaign.campaign_id})
        else:
            return Response({'status': 'Already joined this campaign', 'campaign_id': campaign.campaign_id})
        
    @action(detail=True, methods=['get'], url_path='ranking')
    def ranking(self, request, pk=None):
        """
        Retorna o ranking de alunos da campanha.
        Route: GET /campaigns/<pk>/ranking/
        """
        campaign = self.get_object() # Agora sim, busca uma CampaignGroup validada
        rankings = CampaignRanking.objects.filter(campaign=campaign).order_by('-points')
        serializer = CampaignRankingSerializer(rankings, many=True, context={'request': request})
        return Response(serializer.data)

class PracticeExamViewSet(viewsets.ModelViewSet):
    queryset = PracticeExam.objects.all()
    serializer_class = PracticeExamSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'clone_question']:
            return [IsAuthenticated(), IsTeacher()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'is_teacher', False):
            return PracticeExam.objects.all()
        # Students only see published active exams
        return PracticeExam.objects.filter(status=PracticeExam.ExamStatus.PUBLISHED, is_active=True)

    @action(detail=True, methods=['post'])
    def clone_question(self, request, pk=None):
        exam = self.get_object()
        question_id = request.data.get('question_id')
        try:
            original_q = Question.objects.get(pk=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Deep copy
        original_q.pk = None
        original_q.save()
        # Add to exam
        exam.questions.add(original_q)
        return Response({'status': 'Question cloned and added', 'new_question_id': original_q.pk})

class PracticeExamSubmissionViewSet(viewsets.ModelViewSet):
    queryset = PracticeExam_Submission.objects.all()
    serializer_class = PracticeExamSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def get_queryset(self):
        if getattr(self.request.user, 'is_teacher', False):
            return PracticeExam_Submission.objects.all()
        return PracticeExam_Submission.objects.filter(student=self.request.user)

class AntiCheatLogViewSet(viewsets.ModelViewSet):
    queryset = AntiCheatLog.objects.all()
    serializer_class = AntiCheatLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def get_queryset(self):
        if getattr(self.request.user, 'is_teacher', False):
            return AntiCheatLog.objects.all()
        return AntiCheatLog.objects.filter(student=self.request.user)
