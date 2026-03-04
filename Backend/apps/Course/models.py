from django.db import models
from uuid import uuid4

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    course_name = models.CharField(max_length=255, db_column='course_name')
    course_year = models.IntegerField(db_column='course_year')
    is_active = models.BooleanField(default=True, db_column='is_active')
    color = models.CharField(default='#000000', max_length=7, db_column='color')  # Ex: #RRGGBB
    
    def __str__(self):
        return self.course_name
    
    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        db_table = 'Course'
        ordering = ['course_year']
        