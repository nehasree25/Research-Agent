from django.urls import path
from .views import ResearchAPIView, ResearchStreamView, HealthCheckView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health_check'),
    path('research', ResearchAPIView.as_view(), name='research_post'),
    path('research/research', ResearchAPIView.as_view(), name='research_post_alt'),
    path('research/stream', ResearchStreamView.as_view(), name='research_stream_get'),
]
