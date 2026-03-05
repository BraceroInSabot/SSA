from rest_framework.serializers import ModelSerializer
from apps.Activity.models import Activity

class ActivitySerializer(ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['id']