from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),
    path('api/user/', include('apps.AuthUser.urls')),
    path('api/course/', include('apps.Course.urls')),
    path('api/activity/', include('apps.Activity.urls')),
]
