from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, ContractorProfile
from .serializers import (
    UserRegistrationSerializer, 
    UserSerializer,
    ContractorProfileSerializer
)


class RegisterConsumerView(generics.CreateAPIView):
    """Register a new consumer"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        # Force user_type to consumer
        data = request.data.copy()
        data['user_type'] = 'consumer'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "Consumer account created successfully. Please verify your email."
        }, status=status.HTTP_201_CREATED)


class RegisterContractorView(generics.CreateAPIView):
    """Register a new contractor"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        # Force user_type to contractor
        data = request.data.copy()
        data['user_type'] = 'contractor'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "Contractor account created successfully. Please complete your profile."
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user


class CompleteContractorProfileView(generics.CreateAPIView):
    """Complete contractor profile after registration"""
    serializer_class = ContractorProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def create(self, request, *args, **kwargs):
        # Check if user is contractor
        if request.user.user_type != 'contractor':
            return Response(
                {"error": "Only contractors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if profile already exists
        if hasattr(request.user, 'contractor_profile'):
            return Response(
                {"error": "Profile already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)