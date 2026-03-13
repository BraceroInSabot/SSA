#!/bin/sh

echo "Aguardando o banco de dados (PostgreSQL) iniciar..."
sleep 5 

echo "Aplicando migrações..."
python manage.py migrate --noinput

echo "Criando superusuário se não existir..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='$SYS_EMAIL').exists() or User.objects.create_superuser(email='$SYS_EMAIL', teacher_name='$SYS_NAME', password='$SYS_PASSWORD')"

echo "Iniciando Gunicorn..."
exec gunicorn setup.wsgi:application --bind 0.0.0.0:8000