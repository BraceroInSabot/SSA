from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.AuthUser.serializer import CustomTokenObtainPairSerializer, UpdateUserSerializer
import csv
import io
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db import transaction
from django.contrib.auth import get_user_model 
User = get_user_model()

class LoginView(TokenObtainPairView):
    """Get user credential and return two JWT tokens (Access and Refresh) for stateless authentication."""
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    """Invalid the given att token, insert it into a blacklist and logoff his section."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Logout user."""
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "O parâmetro 'refresh' é obrigatório no corpo da requisição. Faça a limpeza dos cookies do seu navegador e tente novamente."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response(
                {"detail": "Token inválido, corrompido ou já expirado. Faça a limpeza do cache do seu navegador e tente novamente."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_info = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'image': user.image.url if user.image else None,
            'is_student': user.is_student,
            'is_teacher': user.is_teacher
        }
        return Response(user_info)
    
class UserUpdateView(APIView):
    serializer_class = UpdateUserSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = self.serializer_class(
            instance=request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)


class StudentImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_teacher:
            return Response({"error": "Acesso negado. Apenas professores podem importar alunos."}, status=status.HTTP_403_FORBIDDEN)

        csv_file = request.FILES.get('file')
        if not csv_file or not csv_file.name.endswith('.csv'):
            return Response({"error": "Por favor, envie um arquivo .csv válido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            
            reader = csv.DictReader(io_string, delimiter=';')
            
            reader.fieldnames = [name.strip() for name in reader.fieldnames if name] # type: ignore

            if 'Nome Completo' not in reader.fieldnames or 'RA' not in reader.fieldnames:
                return Response({"error": "Cabeçalhos inválidos. O CSV deve conter 'Nome Completo' e 'RA'."}, status=status.HTTP_400_BAD_REQUEST)

            alunos_criados = 0
            erros = []

            with transaction.atomic():
                for index, row in enumerate(reader, start=2):
                    nome_completo = row.get('Nome Completo', '').strip()
                    ra_raw = row.get('RA', '').strip()

                    if not nome_completo or not ra_raw:
                        erros.append(f"Linha {index}: Nome ou RA em branco.")
                        continue

                    ra_limpo = ''.join(filter(str.isalnum, ra_raw))
                    
                    if len(ra_limpo) < 4:
                        erros.append(f"Linha {index}: RA '{ra_raw}' é inválido (muito curto).")
                        continue

                    primeiro_nome = nome_completo.split()[0].lower()
                    ultimos_4_ra = ra_limpo[-4:]
                    
                    email_gerado = f"{ra_limpo}sp@aluno.educacao.sp.gov.br"
                    senha_gerada = f"{primeiro_nome}{ultimos_4_ra}"

                    if User.objects.filter(email=email_gerado).exists():
                        erros.append(f"Linha {index}: O e-mail {email_gerado} já existe no sistema.")
                        continue

                    User.objects.create_user(
                        email=email_gerado,
                        password=senha_gerada,
                        name=nome_completo,
                    )  # type: ignore
                    alunos_criados += 1

            if erros:
                return Response({
                    "criados": alunos_criados,
                    "avisos": erros
                }, status=status.HTTP_207_MULTI_STATUS)

            return Response({"criados": alunos_criados, "mensagem": "Importação limpa e concluída com sucesso."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Falha no processamento: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)