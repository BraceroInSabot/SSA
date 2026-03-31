from rest_framework.serializers import ModelSerializer, SerializerMethodField, CharField, UUIDField
from apps.Activity.models import Activity, Activity_Attached_Files, Activity_Submission
from apps.Question.serializer import QuestionsSerializer
import json
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.Question.models import Question
from typing import List, Dict, Any

class ActivityFileSerializer(ModelSerializer):
    class Meta:
        model = Activity_Attached_Files
        fields = ['attached_files_id', 'file', 'activity']
        read_only_fields = ['attached_files_id']

class ActivitySerializer(ModelSerializer):
    """
    Unified serializer for the Activity resource.
    WARNING: Contains heavy SerializerMethodFields. Handle querysets carefully to avoid N+1.
    """
    attached_files = ActivityFileSerializer(many=True, read_only=True)
    has_student_submission = SerializerMethodField()
    teacher_submission = SerializerMethodField()

    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['activity_id']

    def get_has_student_submission(self, obj: Activity) -> bool:
        request = self.context.get('request')
        
        if not request or not getattr(request.user, 'is_authenticated', False) or getattr(request.user, 'is_teacher', False):
            return False
            
        return Activity_Submission.objects.filter(
            activity=obj, 
            student=request.user
        ).exists()
        
    def get_teacher_submission(self, obj: Activity) -> List[Dict[str, Any]]:
        request = self.context.get('request')
        
        if not request or not getattr(request.user, 'is_authenticated', False) or not getattr(request.user, 'is_student', False):
            return []
        
        # FIX: select_related('submission_question') prevents N+1 DB hits inside the loop.
        submissions = Activity_Submission.objects.filter(
            activity=obj, 
            student=request.user
        ).exclude(has_teacher_revision=False).select_related('submission_question')
        
        result: List[Dict[str, Any]] = []
        
        for sub in submissions:
            question = sub.submission_question
            
            # Architectural typing fix. Replacing the 4 '# type: ignore' hacks.
            assert question is not None, "A submission must be tied to a valid question."
            
            # Decoupling logic for readability
            is_text_based = question.question_type in (Question.QuestionType.SHORT_ANSWER, Question.QuestionType.ESSAY)
            response_data = {"response": sub.submission} if is_text_based else {
                "response": sub.submission, 
                "response_text": question.question_options
            }

            result.append({
                "has_feedback": True, 
                "teacher_feedback": sub.teacher_feedback,
                "activity_final_grade": sub.submission_grade,
                "question_type": question.question_type,
                "question_description": question.question_description,
                "question_response": response_data,
                "question_expected_result": question.question_response,
            })
            
        return result
        
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
        
