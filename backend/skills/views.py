from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .models import Skill
from .serializers import SkillSerializer

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.filter(is_visible=True)
    serializer_class = SkillSerializer


class SkillRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class OfferedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer


    def get_queryset(self):
        return Skill.objects.filter(is_offered=True, is_visible=True)

class RequestedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer


    def get_queryset(self):
        return Skill.objects.filter(is_offered=False, is_visible=True)

class MySkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]  # Make sure only authenticated users can access

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

class SkillSearchView(generics.ListAPIView):
    serializer_class = SkillSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'tags']  # Fields to search on

    def get_queryset(self):
        queryset = Skill.objects.filter(is_visible=True)
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(name__icontains=q)
        return queryset
