from django.shortcuts import render
from rest_framework import viewsets,filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAdminUser
from .models import ServiceOffering, Skill, ServiceRequest
from rest_framework.decorators import action
from .serializers import ServiceOfferingSerializer, SkillSerializer, ServiceRequestSerializer

class ServiceOfferingViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceOfferingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only return offerings created by the logged-in user
        if self.request.user.is_authenticated:
            return ServiceOffering.objects.filter(user=self.request.user)
        return ServiceOffering.objects.none()  # Anonymous users see nothing

    def perform_create(self, serializer):
        # Automatically set the user field
        serializer.save(user=self.request.user)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Anyone can read; only logged-in users can modify
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['mode','name']          
    search_fields = ['name','description']           




class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only return requests created by the logged-in user
        if self.request.user.is_authenticated:
            return ServiceRequest.objects.filter(user=self.request.user)
        return ServiceRequest.objects.none()

    def perform_create(self, serializer):
        # Automatically set the user field
        serializer.save(user=self.request.user)
# Custom action to update the status
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        service_request = self.get_object()
        new_status = request.data.get('status')
        
        # Ensure status is provided and is valid
        if new_status not in dict(ServiceRequest.STATUS_CHOICES).keys():
            return Response({'error': 'Invalid status value provided.'}, status=400)
        
        # Update the status field
        service_request.status = new_status
        service_request.save()
        
        return Response(ServiceRequestSerializer(service_request).data)
