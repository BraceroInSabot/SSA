from django.urls import path
from .views import (
    ActivityListView, 
    ActivityDetailView, 
    ActivityCreateView,
    ActivityUpdateView
)


urlpatterns = [
    path('', ActivityListView.as_view(), name='activity-list'),
    path('<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('create/', ActivityCreateView.as_view(), name='activity-create'),
    path('update/<int:pk>/', ActivityUpdateView.as_view(), name='activity-update'),
]