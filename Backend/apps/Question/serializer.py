
from rest_framework.serializers import ModelSerializer
from apps.Question.models import Question

class QuestionsSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['question_id']