
from django.contrib import admin
from .models import Skill, ServiceOffering,ServiceRequest

admin.site.register(Skill)
admin.site.register(ServiceOffering)
admin.site.register(ServiceRequest)

