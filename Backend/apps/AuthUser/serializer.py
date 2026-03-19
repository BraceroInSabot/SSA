from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.serializers import ModelSerializer, CharField, ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.AuthUser.models import AuthUser
from django.contrib.auth.password_validation import validate_password

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adicione os dados customizados aqui
        token['name'] = user.name
        token['email'] = user.email
        token['image'] = user.image.url if user.image else None
        token['is_teacher'] = user.is_teacher
        token['is_student'] = user.is_student

        return token
    
class UpdateUserSerializer(ModelSerializer):
    current_password = CharField(write_only=True, required=False)
    new_password = CharField(write_only=True, required=False)

    class Meta:
        model = AuthUser
        fields = ['image', 'email', 'current_password', 'new_password']

    def validate(self, attrs):
        current_password = attrs.get('current_password')
        new_password = attrs.get('new_password')

        if new_password:
            if not current_password:
                raise ValidationError(
                    {"current_password": "A senha atual é obrigatória para definir uma nova."}
                )
            
            user = self.instance
            if not user.check_password(current_password): # type: ignore
                raise ValidationError(
                    {"current_password": "A senha atual está incorreta."}
                )
            
            try:
                validate_password(new_password, user)
            except DjangoValidationError as e:
                raise ValidationError(
                    {"new_password": list(e.messages)}
                )

        return attrs

    def update(self, instance, validated_data):
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('current_password', None)

        instance = super().update(instance, validated_data)

        if new_password:
            instance.set_password(new_password)
            instance.save()

        return instance