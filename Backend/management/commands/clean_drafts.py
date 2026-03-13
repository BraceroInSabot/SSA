from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.Activity.models import Activity

class Command(BaseCommand):
    help = 'Remove rascunhos de atividades abandonados há mais de 48 horas.'

    def handle(self, *args, **kwargs):
        cutoff_time = timezone.now() - timedelta(hours=48)
        
        abandoned_drafts = Activity.objects.filter(
            status=Activity.ActivityStatus.DRAFT,
            lauched_at__lt=cutoff_time
        )
        
        count = abandoned_drafts.count()
        abandoned_drafts.delete()
        
        self.stdout.write(self.style.SUCCESS(f'{count} rascunhos abandonados foram removidos.'))