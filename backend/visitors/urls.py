from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet ,VisitorStatsView, DepartmentStatsView

router = DefaultRouter()
router.register(r'', VisitorViewSet, basename='visitors')


urlpatterns = [
    path('', include(router.urls)),
    path('stats/', VisitorStatsView.as_view(), name='visitor-stats'),
    path('department_stats/', DepartmentStatsView.as_view(), name='department-stats'),
]