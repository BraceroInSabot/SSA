from simple_history.models import HistoricalRecords
from django.contrib.auth import get_user_model
User = get_user_model()
from apps.Question.models import Question
from django.db import models
from uuid import uuid4

class Activity(models.Model):
    class ActivityType(models.TextChoices):
        ATV = 'ATV', 'Activity'
        LAB = 'LAB', 'Lab'
        PRJ = 'PRJ', 'Project'
        TST = 'TST', 'Test'
        FIL = 'FIL', 'File'
        
    class ActivityStatus(models.TextChoices):
        DRAFT = 'DRF', 'Draft'
        PUBLISHED = 'PUB', 'Published'
        
    activity_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='activity_PK')
    name = models.CharField(max_length=255, db_column='activity_name')
    total_grade = models.FloatField(db_column='activity_total_grade')
    has_submission = models.BooleanField(default=True, db_column='activity_has_submission')
    to_be_launched = models.DateTimeField(db_column='to_be_launched')
    lauched_at = models.DateTimeField(auto_now_add=True, db_column='activity_lauched_at')
    due_date = models.DateTimeField(db_column='activity_due_date')
    description = models.TextField(db_column='activity_description')
    is_active = models.BooleanField(default=True, db_column='activity_is_active')
    course = models.ForeignKey('Course.Course', on_delete=models.CASCADE, related_name='activities', db_column='activity_course_FK')
    activity_type = models.CharField(max_length=3, default=ActivityType.ATV, choices=ActivityType.choices, db_column='activity_type')
    status = models.CharField(max_length=3, choices=ActivityStatus.choices, default=ActivityStatus.DRAFT, db_column='activity_status')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        db_table = 'Activity'
        
class Activity_Attached_Files(models.Model):
    attached_files_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='attached_files_PK')
    file = models.FileField(upload_to='activity_files/', db_column='file')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='attached_files', db_column='attached_files_activity_FK')
    
    def __str__(self):
        return f"File for {self.activity.name}"
    
    class Meta:
        verbose_name = 'Attached File'
        verbose_name_plural = 'Attached Files'
        db_table = 'Attached_Files'
        
class Activity_Submission(models.Model):
    submission_id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='submission_PK')
    submission_grade = models.FloatField(db_column='submission_grade', default=0.0)
    submission_question = models.ForeignKey(Question, on_delete=models.CASCADE, default=None, related_name='submissions', db_column='submission_question_FK')
    teacher_feedback = models.TextField(db_column='teacher_feedback', default='', blank=True)
    has_teacher_revision = models.BooleanField(db_column='has_teacher_reviision', default=False)
    submission = models.JSONField(db_column='submission_response', default=dict)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions', db_column='submission_student_FK')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='submissions', db_column='submission_activity_FK')
    submitted_at = models.DateTimeField(auto_now_add=True, db_column='submission_submitted_at')
    file = models.FileField(upload_to='question_submissions/', db_column='submission_file')
    history = HistoricalRecords(custom_model_name='Activity_Submission_History')
    
    def __str__(self):
        return f"Submission by {self.student.name} for {self.activity.name}" # type: ignore
    
    class Meta:
        verbose_name = 'Activity Submission'
        verbose_name_plural = 'Activity Submissions'
        db_table = 'Activity_Submission'