from django.urls import path
from . import views
from .views import SkillTagsView

urlpatterns = [
    path('skills/', views.SkillListCreateView.as_view(), name='skill-list-create'),
    path('skills/<int:pk>/', views.SkillRetrieveUpdateDestroyView.as_view(), name='skill-detail'),
    path('skills/offered/', views.OfferedSkillsView.as_view(), name='offered-skills'),
    path('skills/requested/', views.RequestedSkillsView.as_view(), name='requested-skills'),
    path('skills/me/', views.MySkillsView.as_view(), name='my-skills'),
    path('skills/search/', views.SkillSearchView.as_view(), name='skill-search'),
     path('skills/tags/', SkillTagsView.as_view(), name='skill-tags'),
]
