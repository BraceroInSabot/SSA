from rest_framework import serializers
from .models import CampaignGroup, CampaignRanking, PracticeExam, PracticeExam_Submission, AntiCheatLog
from apps.Question.models import Question
from apps.Question.serializer import QuestionSerializer

class CampaignRankingSerializer(serializers.ModelSerializer):
    student_id = serializers.UUIDField(source='student.id', read_only=True)
    student_image = serializers.SerializerMethodField(read_only=True)    
    student = serializers.CharField(source='student.name', read_only=True)
    
    class Meta:
        model = CampaignRanking
        fields = ['id', 'student_id', 'student', 'student_image', 'points']

    def get_student_image(self, obj):
        request = self.context.get('request')
        student_image = getattr(obj.student, 'image', None)

        if not request or not student_image:
            return None

        return request.build_absolute_uri(student_image.url)



class CampaignGroupSerializer(serializers.ModelSerializer):
    rankings = CampaignRankingSerializer(many=True, read_only=True)
    
    class Meta:
        model = CampaignGroup
        fields = '__all__'

class PracticeExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = PracticeExam
        fields = '__all__'
        read_only_fields = ['exam_id']

class PracticeExamSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeExam_Submission
        fields = '__all__'
        read_only_fields = ('student', 'submitted_at')

class AntiCheatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AntiCheatLog
        fields = '__all__'
        read_only_fields = ('student', 'left_at')
