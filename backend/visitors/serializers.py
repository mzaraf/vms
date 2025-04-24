from rest_framework import serializers
from .models import Visitor, Department
from accounts.serializers import DepartmentSerializer
from django.utils import timezone

class VisitorSerializer(serializers.ModelSerializer):
    department = serializers.StringRelatedField(source='department.name')
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Visitor
        fields = [
            'id', 'name', 'email', 'phone', 'purpose', 'department', 'department_id',
            'host','organization', 'address', 'status', 'status_display', 'visit_date', 'check_in_time',
            'check_out_time', 'created_at', 'avatar'
        ]
        read_only_fields = ['check_out_time', 'created_at', 'avatar']
    
    def validate_visit_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Visit date cannot be in the past")
        return value