from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField
from apps.Course.models import Course, Bimestre

class CourseSerializer(ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id']
        exclude_fields = ['color']

class BimestreSerializer(ModelSerializer):
    courses = PrimaryKeyRelatedField(
        many=True, 
        queryset=Course.objects.all(), 
        required=False
    )

    class Meta:
        model = Bimestre
        fields = ['id', 'name', 'year', 'courses']
        read_only_fields = ['id']