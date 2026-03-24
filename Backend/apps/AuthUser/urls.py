from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, UserInfoView, UserUpdateView, StudentImportView


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('info/', UserInfoView.as_view(), name='user-info'),
    path('update/', UserUpdateView.as_view(), name='user-update'),
    path('import-students/', StudentImportView.as_view(), name='student-import')
]