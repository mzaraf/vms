from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  # All auth routes moved to accounts/urls.py
    path('api/users/', include('accounts.user_urls')),  # User management
    path('api/departments/', include('departments.urls')),
    path('api/visitors/', include('visitors.urls')),
]