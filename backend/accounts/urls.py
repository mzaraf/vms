from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LogoutView, CurrentUserView, CustomTokenObtainPairView, CustomTokenRefreshView

urlpatterns = [
    # JWT Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    # Session Authentication (if needed)
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),  # or custom view
    path('logout/', LogoutView.as_view(), name='logout'),
]