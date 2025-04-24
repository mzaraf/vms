from django.db import models
from accounts.models import User
from departments.models import Department 

class Visitor(models.Model):
    STATUS_CHOICES = [
        ('pre-registered', 'Pre-Registered'),
        ('checked-in', 'Checked In'),
        ('checked-out', 'Checked Out'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    purpose = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='visitors')
    host = models.CharField(max_length=100)
    organization = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pre-registered')
    visit_date = models.DateField()
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    avatar = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_visitors')
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        if not self.avatar and self.name:
            self.avatar = f"https://ui-avatars.com/api/?name={self.name.replace(' ', '+')}&background=random"
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['visit_date']),
            models.Index(fields=['department']),
        ]