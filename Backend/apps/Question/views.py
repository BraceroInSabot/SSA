from django.shortcuts import render
from .models import Question
from .serializer import QuestionsSerializer, QuestionUpdateSerializer, ListQuestionsPerActivitySerializer, ListQuestionsPerActivityWithResponseSerializer
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView

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