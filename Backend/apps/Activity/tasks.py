from celery import shared_task
from django.utils.timezone import now
from apps.Activity.models import Activity

@shared_task
def publish_scheduled_activities():
    """
    [RnF046] Garante a publicação automatizada de simulados e provas.
    Deve ser mapeado no celery-beat-schedule (ex: a cada 1 minuto).
    """
    activities_to_publish = Activity.objects.filter(
        status=Activity.ActivityStatus.DRAFT,
        to_be_launched__lte=now(),
        is_active=True
    )
    
    updated_count = activities_to_publish.update(status=Activity.ActivityStatus.PUBLISHED)
    
    return f"{updated_count} atividades publicadas automaticamente pelo Celery."