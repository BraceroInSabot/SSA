#!/bin/sh

echo "Aguardando o banco de dados (PostgreSQL) iniciar corretamente..."
python -c "
import sys, time, os, psycopg2
from psycopg2 import OperationalError
while True:
    try:
        psycopg2.connect(
            dbname=os.environ.get('DB_NAME'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            host=os.environ.get('DB_HOST', 'db'),
            port=5432
        )
        break
    except OperationalError:
        print('Aguardando Postgres aceitar conexões...')
        time.sleep(1)
"

echo "Aplicando migrações..."
python manage.py migrate --noinput

echo "Verificando/Criando superusuário..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='$SYS_EMAIL').exists() or User.objects.create_superuser(email='$SYS_EMAIL', name='$SYS_NAME', password='$SYS_PASSWORD')"

echo "Iniciando Gunicorn com multiprocessamento..."
exec gunicorn ssa.wsgi:application --bind 0.0.0.0:8000 -w 5