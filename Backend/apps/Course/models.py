from django.db import models
from uuid import uuid4
from django.db.models import Avg, Count, F, Q

class Bimestre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255, db_column='name')
    year = models.IntegerField(db_column='year')

    def __str__(self):
        return f"{self.name} - {self.year}"

    class Meta:
        verbose_name = 'Bimestre'
        verbose_name_plural = 'Bimestres'
        db_table = 'Bimestre'
        ordering = ['-year', 'name']


class Course(models.Model):
    course_id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    course_name = models.CharField(max_length=255, db_column='course_name')
    course_year = models.IntegerField(db_column='course_year')
    is_active = models.BooleanField(default=True, db_column='is_active')
    color = models.CharField(default='#000000', max_length=7, db_column='color')  # Ex: #RRGGBB
    bimester = models.ForeignKey(Bimestre, null=True, blank=True, on_delete=models.SET_NULL, related_name='courses', db_column='bimestre_id')
    
    def __str__(self):
        return self.course_name
        
    def analytics(self):
        activities = self.activities.filter(is_active=True)
        total_activities = activities.count()
        
        # Atividades e médias
        activities_data = []
        global_grade_sum = 0
        global_max_sum = 0
        
        for activity in activities:
            submissions = activity.submissions.all()
            sub_count = submissions.count()
            avg_grade = submissions.aggregate(avg=Avg('submission_grade'))['avg'] or 0
            
            # Taxa de erros e acertos baseado na nota (grade / total_grade)
            acertos_rate = (avg_grade / activity.total_grade * 100) if activity.total_grade > 0 else 0
            erros_rate = 100 - acertos_rate if activity.total_grade > 0 else 0
            
            activities_data.append({
                'activity_id': activity.activity_id,
                'name': activity.name,
                'total_grade': activity.total_grade,
                'average_grade': round(avg_grade, 2),
                'submission_count': sub_count,
                'hit_rate': round(acertos_rate, 2),
                'miss_rate': round(erros_rate, 2),
            })
            
            global_grade_sum += avg_grade
            global_max_sum += activity.total_grade
            
        global_average = (global_grade_sum / global_max_sum * 100) if global_max_sum > 0 else 0
        
        # Engajamento dos alunos
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Estudantes que fizeram pelo menos uma submissão no curso
        students_with_submissions = User.objects.filter(
            submissions__activity__course=self
        ).annotate(
            submission_count=Count('submissions', filter=Q(submissions__activity__course=self))
        ).distinct()
        
        engagement_ranking = []
        for student in students_with_submissions:
            # Pendências: total de atividades - submissões feitas por este aluno neste curso
            # (assumindo que todas as atividades são para todos os alunos)
            pendencies = total_activities - student.submission_count
            engagement_ranking.append({
                'student_id': student.id,
                'student_name': student.name,
                'submissions': student.submission_count,
                'pendencies': pendencies if pendencies > 0 else 0
            })
            
        engagement_ranking = sorted(engagement_ranking, key=lambda x: x['submissions'], reverse=True)
        
        return {
            'global_average': round(global_average, 2),
            'total_activities': total_activities,
            'activities_metrics': activities_data,
            'engagement_ranking': engagement_ranking,
        }
    
    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        db_table = 'Course'
        ordering = ['course_year']
        