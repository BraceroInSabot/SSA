from apps.Activity.models import Activity
from simple_history.models import HistoricalRecords
from django.contrib.auth import get_user_model
User = get_user_model()
from django.db import models
from uuid import uuid4

class Question(models.Model):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'MC', 'Multiple Choice'
        UNIQUE_CHOICE = 'UC', 'Unique Choice'
        TRUE_FALSE = 'TF', 'True/False'
        SHORT_ANSWER = 'SA', 'Short Answer'
        ESSAY = 'ES', 'Essay'
    
    question_id = models.UUIDField(primary_key=True, editable=False, default=uuid4, db_column='question_PK')
    question_description = models.TextField(db_column='question_description')
    question_expected_result = models.FloatField(db_column='question_expected_result', default=0.0)
    question_type = models.CharField(choices=QuestionType.choices, db_column='question_type', max_length=2)
    activity = models.ManyToManyField('Activity.Activity', related_name='questions', db_column='question_activity_FK')
    question_response = models.JSONField(db_column='question_response', default=dict)
    
    def __str__(self):
        return self.question_description
    
    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        db_table = 'Question'

class Question_Submission(models.Model):
    submission_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='submission_PK')
    submission_grade = models.FloatField(db_column='submission_grade', default=0.0)
    teacher_feedback = models.TextField(db_column='teacher_feedback', default='')
    submission = models.JSONField(db_column='submission_response', default=dict)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions', db_column='submission_student_FK')
    submission_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='submissions', db_column='submission_question_FK')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='submissions', db_column='submission_activity_FK')
    submitted_at = models.DateTimeField(auto_now_add=True, db_column='submission_submitted_at')
    file = models.FileField(upload_to='question_submissions/', db_column='submission_file')
    history = HistoricalRecords(custom_model_name='Question_Submission_History')
    
    def __str__(self):
        return f"Submission by {self.student.username} for {self.activity.name}, question [{self.submission_question.question_id}] {self.submission_question.question_description}"
    
    class Meta:
        verbose_name = 'Question Submission'
        verbose_name_plural = 'Question Submissions'
        db_table = 'Question_Submission'