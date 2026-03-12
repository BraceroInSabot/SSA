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
    question_grade = models.FloatField(db_column='question_grade', default=0.0)
    question_type = models.CharField(choices=QuestionType.choices, db_column='question_type', max_length=2)
    activity = models.ManyToManyField('Activity.Activity', related_name='questions', db_column='question_activity_FK')
    question_response = models.JSONField(db_column='question_response', default=dict)
    
    def __str__(self):
        return self.question_description
    
    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        db_table = 'Question'
        