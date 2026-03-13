from django.db import models
from uuid import uuid4

class Activity(models.Model):
    class ActivityType(models.TextChoices):
        ATV = 'ATV', 'Activity'
        LAB = 'LAB', 'Lab'
        PRJ = 'PRJ', 'Project'
        TST = 'TST', 'Test'
        
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