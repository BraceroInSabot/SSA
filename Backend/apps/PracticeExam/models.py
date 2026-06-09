from django.db import models
from django.contrib.auth import get_user_model
from uuid import uuid4

User = get_user_model()

import random
import string

def generate_access_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class CampaignGroup(models.Model):
    campaign_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='campaign_PK')
    name = models.CharField(max_length=255, db_column='campaign_name')
    description = models.TextField(db_column='campaign_description', blank=True, null=True)
    access_code = models.CharField(max_length=10, default=generate_access_code, db_column='campaign_access_code')
    is_active = models.BooleanField(default=True, db_column='campaign_is_active')
    created_at = models.DateTimeField(auto_now_add=True, db_column='campaign_created_at')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Campaign Group'
        verbose_name_plural = 'Campaign Groups'
        db_table = 'Campaign_Group'
        
class CampaignRanking(models.Model):
    """
    Armazena os pontos isolados (Gamificação) dos alunos de forma segregada ao total_grade.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    campaign = models.ForeignKey(CampaignGroup, on_delete=models.CASCADE, related_name='rankings')
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.FloatField(default=0.0)
    
    def __str__(self):
        return f"{self.student.name} - {self.points}"  # type: ignore

    class Meta:
        unique_together = ('campaign', 'student')

class PracticeExam(models.Model):
    class ExamStatus(models.TextChoices):
        DRAFT = 'DRF', 'Draft'
        PUBLISHED = 'PUB', 'Published'

    exam_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='exam_PK')
    name = models.CharField(max_length=255, db_column='exam_name')
    campaign_group = models.ForeignKey(CampaignGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='exams', db_column='exam_campaign_FK')
    total_grade = models.FloatField(db_column='exam_total_grade', default=0.0)
    to_be_launched = models.DateTimeField(db_column='exam_to_be_launched')
    launched_at = models.DateTimeField(auto_now_add=True, db_column='exam_launched_at')
    due_date = models.DateTimeField(db_column='exam_due_date')
    description = models.TextField(db_column='exam_description')
    is_active = models.BooleanField(default=True, db_column='exam_is_active')
    course = models.ForeignKey('Course.Course', on_delete=models.CASCADE, related_name='practice_exams', db_column='exam_course_FK')
    status = models.CharField(max_length=3, choices=ExamStatus.choices, default=ExamStatus.DRAFT, db_column='exam_status')
    questions = models.ManyToManyField('Question.Question', related_name='practice_exams', db_column='exam_question_FK')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Practice Exam'
        verbose_name_plural = 'Practice Exams'
        db_table = 'Practice_Exam'

class PracticeExam_Submission(models.Model):
    submission_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='exam_submission_PK')
    submission_grade = models.FloatField(db_column='submission_grade', default=0.0)
    submission_question = models.ForeignKey('Question.Question', on_delete=models.CASCADE, related_name='exam_submissions', db_column='submission_question_FK', null=True)
    submission = models.JSONField(db_column='submission_response', default=dict)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_submissions', db_column='submission_student_FK')
    practice_exam = models.ForeignKey(PracticeExam, on_delete=models.CASCADE, related_name='submissions', db_column='submission_exam_FK')
    submitted_at = models.DateTimeField(auto_now_add=True, db_column='submission_submitted_at')

    def __str__(self):
        return f"Submission by {self.student.name} for {self.practice_exam.name}" # type: ignore

    class Meta:
        verbose_name = 'Practice Exam Submission'
        verbose_name_plural = 'Practice Exam Submissions'
        db_table = 'Practice_Exam_Submission'

class AntiCheatLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='log_PK')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anti_cheat_logs', db_column='log_student_FK')
    submission = models.ForeignKey('Activity.Activity_Submission', on_delete=models.CASCADE, related_name='anti_cheat_logs', db_column='log_submission_FK', null=True)
    left_at = models.DateTimeField(auto_now_add=True, db_column='log_left_at')
    duration_seconds = models.FloatField(db_column='log_duration')

    def __str__(self):
        return f"AntiCheatLog {self.student.name}" # type: ignore

    class Meta:
        verbose_name = 'Anti Cheat Log'
        verbose_name_plural = 'Anti Cheat Logs'
        db_table = 'Anti_Cheat_Log'

