from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),
    path('api/user/', include('apps.AuthUser.urls')),
    path('api/course/', include('apps.Course.urls')),
    path('api/activity/', include('apps.Activity.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)