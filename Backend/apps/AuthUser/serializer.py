from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adicione os dados customizados aqui
        token['name'] = user.name
        token['email'] = user.email
        token['is_teacher'] = user.is_teacher
        token['is_student'] = user.is_student

        return token