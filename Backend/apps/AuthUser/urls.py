from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, UserInfoView, UserUpdateView, StudentImportView


urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('info/', UserInfoView.as_view(), name='user_info'),
    path('update/', UserUpdateView.as_view(), name='user_info'),
    path('import-students/', StudentImportView.as_view(), name='student_import')
]