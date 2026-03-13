from rest_framework.serializers import ModelSerializer
from apps.Activity.models import Activity, Activity_Attached_Files
from apps.Question.serializer import QuestionsSerializer

class ActivityFileSerializer(ModelSerializer):
    class Meta:
        model = Activity_Attached_Files
        fields = ['attached_files_id', 'file', 'activity']
        read_only_fields = ['attached_files_id']

class ActivitySerializer(ModelSerializer):
    attached_files = ActivityFileSerializer(many=True, read_only=True)
    questions = QuestionsSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['activity_id']