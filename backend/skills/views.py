from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .models import Skill
from .serializers import SkillSerializer

# List and Create Skills
class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.filter(is_visible=True)
    serializer_class = SkillSerializer

# Retrieve, Update, and Delete a Skill
class SkillRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Ensure users can only modify their own skills"""
        return Skill.objects.filter(user=self.request.user)

# View all offered skills (those available for teaching or work)
class OfferedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        return Skill.objects.filter(is_offered=True, is_visible=True)

# View all requested skills (those users are seeking)
class RequestedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        return Skill.objects.filter(is_offered=False, is_visible=True)

# View a specific authenticated user's skills
class MySkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user, is_visible=True)

# Skill search functionality
class SkillSearchView(generics.ListAPIView):
    serializer_class = SkillSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'tags']

    def get_queryset(self):
        return Skill.objects.filter(is_visible=True)
