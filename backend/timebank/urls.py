
from django.contrib import admin
from rest_framework import permissions
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

schema_view = get_schema_view(
   openapi.Info(
      title="TimeBank API",
      default_version='v1',
      description="TimeBank API documentation",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@timebank.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('skill', include('skills.urls')), 
    path('admin/', admin.site.urls),
    path('api/wallet/', include('wallet.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/leaderboard/', include('leaderboard.urls')),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

