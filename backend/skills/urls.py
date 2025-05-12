from django.urls import path
from .views import MySkillsListView, SkillListCreateView, SkillDetailView, EndorseSkillView

app_name = "skills"

urlpatterns = [
    # GET: List skills (with search/filter), POST: Create a new skill
    path("", SkillListCreateView.as_view(), name="skill-list-create"),
    path("my/", MySkillsListView.as_view(), name="my-skills"),
    path(
        "<int:pk>/", SkillDetailView.as_view(), name="skill-detail"
    ),  # GET, PUT, PATCH, DELETE
    path("<int:pk>/endorse/", EndorseSkillView.as_view(), name="endorse-skill"),  # POST
]
