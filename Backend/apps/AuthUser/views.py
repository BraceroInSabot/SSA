from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.AuthUser.serializer import CustomTokenObtainPairSerializer

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    pass

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_info = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'is_student': user.is_student,
            'is_teacher': user.is_teacher
        }
        return Response(user_info)
    