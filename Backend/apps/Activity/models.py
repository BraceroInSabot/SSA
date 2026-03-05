from django.utils import timezone
from django.db import models
from uuid import uuid4

class Activity(models.Model):
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
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        db_table = 'Activity'