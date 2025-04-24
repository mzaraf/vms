from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import Visitor
from .serializers import VisitorSerializer
from rest_framework.views import APIView
from django.db.models.functions import Trunc, ExtractWeekDay
from django.db.models import CharField
from django.db.models.functions import Cast


class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Visitor.objects.all()
        
        # Filter by department if user is director
        if self.request.user.role == 'director' and self.request.user.department:
            queryset = queryset.filter(department=self.request.user.department)
            
        # Apply filters
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(department__name__icontains=search)
            )
            
        return queryset.order_by('-visit_date')  # Changed from created_at to visit_date
    
    def perform_create(self, serializer):
        # Get status from validated data or default to 'checked-in'
        status = serializer.validated_data.get('status', 'checked-in')
    
        # Prepare save data
        save_data = {
            'created_by': self.request.user,
            'avatar': f"https://ui-avatars.com/api/?name={serializer.validated_data.get('name','V')}"
        }
    
        # Only set check_in_time if status is 'checked-in'
        if status == 'checked-in':
            save_data['check_in_time'] = timezone.now()
    
        serializer.save(**save_data)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        visitor = self.get_object()
        if visitor.status != 'pre-registered':
            return Response(
                {'error': 'Visitor is not pre-registered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        visitor.status = 'checked-in'
        visitor.check_in_time = timezone.now()
        visitor.save()
        return Response(self.get_serializer(visitor).data)
    
    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        visitor = self.get_object()
        if visitor.status != 'checked-in':
            return Response(
                {'error': 'Visitor is not checked in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        visitor.status = 'checked-out'
        visitor.check_out_time = timezone.now()
        visitor.save()
        return Response(self.get_serializer(visitor).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        period = request.query_params.get('period', 'week')
        
        queryset = Visitor.objects.all()
        if request.user.role == 'director' and request.user.department:
            queryset = queryset.filter(department=request.user.department)
        
        if period == 'week':
            start_date = timezone.now() - timedelta(days=7)
            stats = (
                queryset
                .filter(visit_date__gte=start_date)
                .annotate(
                    date=Cast(ExtractWeekDay('visit_date'), output_field=CharField())
                )
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )
            
            day_map = {
                '1': 'Sunday',
                '2': 'Monday',
                '3': 'Tuesday',
                '4': 'Wednesday',
                '5': 'Thursday',
                '6': 'Friday',
                '7': 'Saturday'
            }
            
            result = [{
                'date': day_map.get(stat['date']),
                'count': stat['count']
            } for stat in stats]
            
        elif period == 'month':
            start_date = timezone.now() - timedelta(days=30)
            stats = (
                queryset
                .filter(visit_date__gte=start_date)
                .annotate(date=Trunc('visit_date', 'day'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )
            
            result = [{
                'date': stat['date'].strftime('%d'),
                'count': stat['count']
            } for stat in stats]
            
        else:  # year
            start_date = timezone.now() - timedelta(days=365)
            stats = (
                queryset
                .filter(visit_date__gte=start_date)
                .annotate(date=Trunc('visit_date', 'month'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )
            
            result = [{
                'date': stat['date'].strftime('%b'),
                'count': stat['count']
            } for stat in stats]
            
        return Response(result)    
    @action(detail=False, methods=['get'])
    def department_stats(self, request):
        queryset = Visitor.objects.all()
        if request.user.role == 'director' and request.user.department:
            queryset = queryset.filter(department=request.user.department)
            
        stats = queryset.values('department__name').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response([{
            'department': stat['department__name'],
            'count': stat['count']
        } for stat in stats])
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = Visitor.objects.all()
        if request.user.role == 'director' and request.user.department:
            queryset = queryset.filter(department=request.user.department)
            
        return Response({
            'total': queryset.count(),
            'checked_in': queryset.filter(status='checked-in').count(),
            'pre_registered': queryset.filter(status='pre-registered').count()
        })


class VisitorStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            period = request.GET.get('period', 'week')
            today = timezone.now().date()
            
            queryset = Visitor.objects.all()
            if request.user.role == 'director' and request.user.department:
                queryset = queryset.filter(department=request.user.department)
            
            if period == 'week':
                start_date = today - timedelta(days=7)
                stats = (
                    queryset
                    .filter(visit_date__gte=start_date)
                    .annotate(
                        date=Cast(ExtractWeekDay('visit_date'), output_field=CharField())
                    )
                    .values('date')
                    .annotate(count=Count('id'))
                    .order_by('date')
                )
                
                day_map = {
                    '1': 'Sunday',
                    '2': 'Monday',
                    '3': 'Tuesday',
                    '4': 'Wednesday',
                    '5': 'Thursday',
                    '6': 'Friday',
                    '7': 'Saturday'
                }
                
                result = [{
                    'date': day_map.get(stat['date']),
                    'count': stat['count']
                } for stat in stats]
                
            elif period == 'month':
                start_date = today - timedelta(days=30)
                stats = (
                    queryset
                    .filter(visit_date__gte=start_date)
                    .annotate(date=Trunc('visit_date', 'day'))
                    .values('date')
                    .annotate(count=Count('id'))
                    .order_by('date')
                )
                
                result = [{
                    'date': stat['date'].strftime('%d'),
                    'count': stat['count']
                } for stat in stats]
                
            else:  # year
                start_date = today - timedelta(days=365)
                stats = (
                    queryset
                    .filter(visit_date__gte=start_date)
                    .annotate(date=Trunc('visit_date', 'month'))
                    .values('date')
                    .annotate(count=Count('id'))
                    .order_by('date')
                )
                
                result = [{
                    'date': stat['date'].strftime('%b'),
                    'count': stat['count']
                } for stat in stats]
                
            return Response(result)
            
        except Exception as e:
            return Response(
                {"error": "Failed to fetch visitor statistics"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepartmentStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            queryset = Visitor.objects.exclude(department__isnull=True)
            
            if request.user.role == 'director' and request.user.department:
                queryset = queryset.filter(department=request.user.department)
            
            stats = (
                queryset
                .values('department__name')
                .annotate(count=Count('id'))
                .order_by('-count')
            )

            return Response([{
                'department': stat['department__name'],
                'count': stat['count']
            } for stat in stats])

        except Exception as e:
            return Response(
                {'error': "Failed to fetch department statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )