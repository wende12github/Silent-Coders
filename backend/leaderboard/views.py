# views.py
from rest_framework import viewsets
from .models import UserStats
from .serializers import UserStatsSerializer

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserStats.objects.all()
    serializer_class = UserStatsSerializer
    # Optionally, we can add ordering by `total_hours_given` if we need top N results.
    ordering = ['-total_hours_given']

    def get_queryset(self):
        # Allow filtering by top N users via query params
        top_n = self.request.query_params.get('top', 10)
        return UserStats.objects.all().order_by('-total_hours_given')[:int(top_n)]
