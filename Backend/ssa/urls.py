from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("api-auth/", include("rest_framework.urls")),
    path('api/user/', include('apps.AuthUser.urls')),
    path('api/course/', include('apps.Course.urls')),
    path('api/activity/', include('apps.Activity.urls')),
    path('api/question/', include('apps.Question.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)