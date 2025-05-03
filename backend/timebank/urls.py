
from django.contrib import admin
from rest_framework import permissions
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

schema_view = get_schema_view(
   openapi.Info(
      title="TimeBank API",
      default_version='v1',
      description="""Welcome to the **TimeBank API** documentation!

This API allows students to exchange skills and services using **time as currency**. Below you'll find all available endpoints categorized by functionality.

### Features:
- Skill offering and booking
- Wallet management
- Group collaboration
- Authentication & token-based security""",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@timebank.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('skill/', include('skills.urls')), 
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),

    path('wallet/', include('wallet.urls')),
    path('bookings/', include('bookings.urls')),
    path('leaderboard/', include('leaderboard.urls')),
    path('groups/', include('groups.urls')),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

