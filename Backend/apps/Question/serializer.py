
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Question

class QuestionsSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['question_id', 'history']
        
class QuestionUpdateSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['question_id', 'history', 'activity']
        
class ListQuestionsPerActivitySerializer(ModelSerializer):
    class Meta:
        model = Question
        read_only_fields = ['question_id', 'history']
        exclude = ['question_response']
        
class ListQuestionsPerActivityWithResponseSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['question_id', 'history']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if not request or not getattr(request.user, 'is_teacher', False):
            data.pop('question_response', None)
            
        return data