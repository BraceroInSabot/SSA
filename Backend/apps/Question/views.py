from django.shortcuts import render
from .models import Question
from .serializer import QuestionsSerializer, QuestionUpdateSerializer, ListQuestionsPerActivitySerializer, ListQuestionsPerActivityWithResponseSerializer
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsTeacher

class ListActivityQuestionsView(ListAPIView):
    serializer_class = ListQuestionsPerActivitySerializer
    
    def get_queryset(self):
        activity_id = self.kwargs.get('pk')
        return Question.objects.filter(activity__activity_id=activity_id)
    
class ListActivityQuestionsWithResponseView(ListAPIView):
    serializer_class = ListQuestionsPerActivityWithResponseSerializer
    
    def get_queryset(self):
        activity_id = self.kwargs.get('pk')
        return Question.objects.filter(activity__activity_id=activity_id)
    
class QuestionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionsSerializer
    lookup_field = 'pk'

class QuestionCreateView(CreateAPIView):
    serializer_class = QuestionsSerializer
    
class QuestionUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionUpdateSerializer
    lookup_field = 'pk'
    
class QuestionDeleteView(RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionsSerializer
    lookup_field = 'pk'

class QuestionBankView(ListAPIView):
    """
    Endpoint para listar questões existentes para reuso (Banco de Questões).
    Filtra por bimestre e course (matéria).
    """
    serializer_class = QuestionsSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        queryset = Question.objects.all()
        bimester = self.request.query_params.get('bimester')
        course = self.request.query_params.get('course')
        
        if bimester:
            # Assumindo que course e bimestre estão associados a questões de alguma forma.
            # Verificaremos a estrutura do modelo Question para fazer a filtragem correta,
            # mas por enquanto adicionamos os filtros nas views considerando relacionamentos comuns.
            # No geral, as questões podem estar ligadas à Activity que tem course e bimester
            # Ou a questão pode ter course e bimester diretamente
            queryset = queryset.filter(activity__course__bimester=bimester)
        if course:
            queryset = queryset.filter(activity__course__course_id=course)
            
        return queryset.distinct()