from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Skill
from .serializers import SkillSerializer

# ✅ Retrieve all unique skill tags
class SkillTagsView(APIView):
    """Get all unique skill tags"""
    def get(self, request):
        all_tags = Skill.objects.values_list('tags', flat=True)
        unique_tags = set()

        # SQLite workaround: Extract and merge tags manually
        for tags in all_tags:
            if isinstance(tags, list):  # Ensure tags are a list
                unique_tags.update(tags)

        return Response(sorted(unique_tags))

# ✅ List and Create Skills with SQLite-Friendly Tag Filtering
class SkillListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.filter(is_visible=True)
        tag = self.request.query_params.get('tag', None)

        if tag:
            # SQLite workaround: filter manually in Python
            queryset = [skill for skill in queryset if tag in skill.tags]

        return queryset

# ✅ Retrieve, Update, and Delete a Skill
class SkillRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

# ✅ Offered Skills View with SQLite-Friendly Tag Filtering
class OfferedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.filter(is_offered=True, is_visible=True)
        tag = self.request.query_params.get('tag', None)

        if tag:
            queryset = [skill for skill in queryset if tag in skill.tags]

        return queryset

# ✅ Requested Skills View with SQLite-Friendly Tag Filtering
class RequestedSkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.filter(is_offered=False, is_visible=True)
        tag = self.request.query_params.get('tag', None)

        if tag:
            queryset = [skill for skill in queryset if tag in skill.tags]

        return queryset

# ✅ View a specific authenticated user's skills
class MySkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)


class SkillSearchView(generics.ListAPIView):
    serializer_class = SkillSerializer

    def get_queryset(self):
        query = self.request.query_params.get('query', '')
        return Skill.objects.filter(name__icontains=query)

