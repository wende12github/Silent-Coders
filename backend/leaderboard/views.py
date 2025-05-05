# views.py
from rest_framework import viewsets
from .models import UserStats
from .serializers import UserStatsSerializer
from django.db.models import F, ExpressionWrapper, FloatField

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserStats.objects.all()
    serializer_class = UserStatsSerializer
    ordering = ['-total_hours_given']

    def get_queryset(self):

        if self.action == 'retrieve':
        return UserStats.objects.all() 
        
        sort_by = self.request.query_params.get('sort_by', 'given')  # default: given
        top_n = int(self.request.query_params.get('top', 10))

        order_map = {
            'given': '-total_hours_given',
            'received': '-total_hours_received',
            'sessions': '-sessions_completed',
            'net': 'net',  # Sorting by annotation if needed
        }

        queryset = UserStats.objects.all()

        if sort_by == 'net':
            queryset = queryset.annotate(
                net=ExpressionWrapper(F('total_hours_given') - F('total_hours_received'), output_field=FloatField())
            ).order_by('-net')[:top_n]
        else:
            queryset = queryset.order_by(order_map.get(sort_by, '-total_hours_given'))[:top_n]

        return queryset
    
