
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceOfferingViewSet, SkillViewSet,ServiceRequestViewSet

router = DefaultRouter()
router.register(r'service-offerings', ServiceOfferingViewSet, basename='service-offering')

router.register(r'skills', SkillViewSet)
router.register(r'requests', ServiceRequestViewSet, basename='service-request')


urlpatterns = [
    path('api/', include(router.urls)),
    
]