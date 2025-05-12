from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import UserStats
from .serializers import UserStatsSerializer
from django.db.models import F, ExpressionWrapper, FloatField, DecimalField
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from decimal import Decimal


class LeaderboardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserStats.objects.all()
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.AllowAny]

    pagination_class = LeaderboardPagination

    @swagger_auto_schema(
        operation_description="Get the global user leaderboard with pagination.",
        manual_parameters=[
            openapi.Parameter(
                "sort_by",
                openapi.IN_QUERY,
                description="Field to sort by: 'given', 'received', 'sessions', or 'net'. Defaults to 'given'.",
                type=openapi.TYPE_STRING,
                enum=["given", "received", "sessions", "net"],
            ),
        ],
        responses={200: UserStatsSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a single user's global stats.",
        responses={200: UserStatsSerializer(), 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        queryset = UserStats.objects.all()

        sort_by = self.request.query_params.get("sort_by", "given")

        order_map = {
            "given": "-total_hours_given",
            "received": "-total_hours_received",
            "sessions": "-sessions_completed",
        }

        if sort_by == "net":
            queryset = queryset.annotate(
                net=ExpressionWrapper(
                    F("total_hours_given") - F("total_hours_received"),
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                )
            ).order_by("-net")
        else:
            queryset = queryset.order_by(order_map.get(sort_by, "-total_hours_given"))

        return queryset
