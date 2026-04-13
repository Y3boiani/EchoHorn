from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterConsumerView, 
    RegisterContractorView,
    UserDetailView, 
    CompleteContractorProfileView
)

urlpatterns = [
    # Authentication
    path('register/consumer/', RegisterConsumerView.as_view(), name='register_consumer'),
    path('register/contractor/', RegisterContractorView.as_view(), name='register_contractor'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('me/', UserDetailView.as_view(), name='user_detail'),
    
    # Contractor
    path('contractor/complete-profile/', CompleteContractorProfileView.as_view(), name='complete_contractor_profile'),
    

]