from celery import shared_task
from django.core.management import call_command

@shared_task
def run_clean_drafts():
    """
    Executa o comando customizado para expurgar rascunhos de atividades da base de dados.
    """
    call_command('clean_drafts')