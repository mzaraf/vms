from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    visitor_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'visitor_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters long")
        return value