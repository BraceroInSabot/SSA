from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

ACTIVITY_API_PREFIX = 'activities'

urlpatterns = [
    path('api/v1/', include("apps.Course.urls")),
    path('api/v1/', include("apps.Activity.urls")),
    path('api/v1/user/', include('apps.AuthUser.urls')),
    
    path("api-auth/", include("rest_framework.urls")),
    
    path('api/v1/question/', include('apps.Question.urls')),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)