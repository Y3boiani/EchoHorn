from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterCustomerView, 
    RegisterDriverView,
    RegisterContractorView,
    UserDetailView, 
    CompleteDriverProfileView,
    CompleteContractorProfileView
)

urlpatterns = [
    # Authentication
    path('register/customer/', RegisterCustomerView.as_view(), name='register_customer'),
    path('register/driver/', RegisterDriverView.as_view(), name='register_driver'),
    path('register/contractor/', RegisterContractorView.as_view(), name='register_contractor'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('me/', UserDetailView.as_view(), name='user_detail'),
    
    # Profile Completion
    path('driver/complete-profile/', CompleteDriverProfileView.as_view(), name='complete_driver_profile'),
    path('contractor/complete-profile/', CompleteContractorProfileView.as_view(), name='complete_contractor_profile'),
]