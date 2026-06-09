from celery import shared_task
from django.utils import timezone
from .models import PracticeExam

@shared_task
def publish_scheduled_practice_exams():
    now = timezone.now()
    exams_to_publish = PracticeExam.objects.filter(
        status=PracticeExam.ExamStatus.DRAFT,
        to_be_launched__lte=now,
        is_active=True
    )
    count = exams_to_publish.update(status=PracticeExam.ExamStatus.PUBLISHED)
    return f"Published {count} practice exams."
