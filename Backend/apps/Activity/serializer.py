from rest_framework.serializers import ModelSerializer, SerializerMethodField, CharField, UUIDField
from apps.Activity.models import Activity, Activity_Attached_Files, Activity_Submission
from apps.Question.serializer import QuestionsSerializer
import json
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.Question.models import Question

class ActivityFileSerializer(ModelSerializer):
    class Meta:
        model = Activity_Attached_Files
        fields = ['attached_files_id', 'file', 'activity']
        read_only_fields = ['attached_files_id']

class ActivitySerializer(ModelSerializer):
    attached_files = ActivityFileSerializer(many=True, read_only=True)
    questions = QuestionsSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['activity_id']
        
class HasStudentSubmission(ModelSerializer):
    class Meta:
        model = Activity_Submission
        fields = ['submission_id']
        read_only_fields = ['submission_id']

class ActivityDetailSerializer(ModelSerializer):
    attached_files = ActivityFileSerializer(many=True, read_only=True)
    has_student_submission = SerializerMethodField()
    teacher_submission = SerializerMethodField()

    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['activity_id']
    
    def get_has_student_submission(self, obj) -> bool:
        """
        Verify if user is logged in. If is a student, check if he had already made a activity submission.
        """
        request = self.context.get('request')
        
        if not request or not getattr(request.user, 'is_authenticated', False):
            return False
            
        return Activity_Submission.objects.filter(
            activity=obj, 
            student=request.user
        ).exists()
        
    def get_teacher_submission(self, obj):
        """
        Retorna uma lista padronizada de feedbacks do professor.
        Garante um contrato previsível: sempre retorna list[], nunca booleanos ou dicionários soltos.
        """
        request = self.context.get('request')
        
        if not request or not getattr(request.user, 'is_authenticated', False) or not getattr(request.user, 'is_student', False):
            return []
        
        submissions = Activity_Submission.objects.filter(
            activity=obj, 
            student=request.user
        ).exclude(has_teacher_revision=False)
        
        return [
            {
                "has_feedback": True, 
                "teacher_feedback": sub.teacher_feedback,
                "activity_final_grade": sub.submission_grade,
                "question_type": sub.submission_question.question_type, # type: ignore
                "question_description": sub.submission_question.question_description, # type: ignore
                "question_response": {"response": sub.submission} if sub.submission_question.question_type in (Question.QuestionType.SHORT_ANSWER, Question.QuestionType.ESSAY) else {"response": sub.submission, "response_text": sub.submission_question.question_options}, # type: ignore
                "question_expected_result": sub.submission_question.question_response, # type: ignore
            }
            for sub in submissions
        ]
        
class ActivitySubmitSerializer(ModelSerializer):
    class Meta:
        model = Activity_Submission
        fields = ['submission_id', 'submission_grade', 'teacher_feedback', 'submission']
        read_only_fields = ['activity_id', 'name', 'total_grade', 'has_submission', 'to_be_launched', 'due_date', 'description', 'course', 'activity_type']
        
    def create(self, validated_data):
        request = self.context.get('request')
        student = request.user # type: ignore
        raw_data = request.data.get('data') # type: ignore

        if not raw_data:
            raise ValidationError({"data": "Payload ausente ou nulo."})

        try:
            parsed_data = json.loads(raw_data)
        except json.JSONDecodeError:
            raise ValidationError({"data": "Falha na decodificação do JSON."})

        created_submissions = []

        with transaction.atomic():
            for item in parsed_data:
                question_id = item.get('submission_question')
                activity_id = item.get('activity')
                
                if not question_id or not activity_id:
                    raise ValidationError({"detail": "Assinatura de dados incompleta. Question ID ou Activity ID ausentes."})

                file_obj = request.FILES.get(f"file_{question_id}") # type: ignore

                submission_instance = self.Meta.model(
                    student=student,
                    activity_id=activity_id,
                    submission_question=Question.objects.get(question_id=question_id),
                    submission=item.get('submission', {}),
                    file=file_obj
                )
                submission_instance.save()
                created_submissions.append(submission_instance)

        return created_submissions
    
class ActivityListSubmissions(ModelSerializer):
    student_name = SerializerMethodField()
    
    class Meta:
        model = Activity_Submission
        fields = ['student', 'student_name', 'submitted_at']
        
    def get_student_name(self, obj):
        return obj.student.name
    
class ActivitySubmissionDetailSerializer(ModelSerializer):
    question_description = CharField(source='submission_question.question_description', read_only=True)

    class Meta:
        model = Activity_Submission
        fields = [
            'submission_id', 
            'submission_grade', 
            'teacher_feedback', 
            'submission', 
            'submission_question', 
            'question_description'
        ]  
    
class ActivityReturnForStudentReviewSerializer(ModelSerializer):
    submission_id = UUIDField()

    class Meta:
        model = Activity_Submission
        fields = ['submission_id', 'submission_grade', 'teacher_feedback']
        
