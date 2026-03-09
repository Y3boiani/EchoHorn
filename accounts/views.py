from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    UserRegistrationSerializer, UserSerializer,
    CustomerProfileSerializer, DriverProfileSerializer, ContractorProfileSerializer
)
from .models import User


class RegisterCustomerView(generics.CreateAPIView):
    """Register a new customer"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        request.data['user_type'] = 'customer'
        return super().create(request, *args, **kwargs)


class RegisterDriverView(generics.CreateAPIView):
    """Register a new driver (creates user + requires driver profile completion)"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        request.data['user_type'] = 'driver'
        return super().create(request, *args, **kwargs)


class RegisterContractorView(generics.CreateAPIView):
    """Register a new contractor"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        request.data['user_type'] = 'contractor'
        return super().create(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Get or update current user details"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class CompleteDriverProfileView(generics.CreateAPIView):
    """Complete driver profile after registration"""
    serializer_class = DriverProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user is a driver
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only drivers can complete driver profile"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if profile already exists
        if hasattr(request.user, 'driver_profile'):
            return Response(
                {"error": "Driver profile already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompleteContractorProfileView(generics.CreateAPIView):
    """Complete contractor profile after registration"""
    serializer_class = ContractorProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user is a contractor
        if request.user.user_type != 'contractor':
            return Response(
                {"error": "Only contractors can complete contractor profile"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if profile already exists
        if hasattr(request.user, 'contractor_profile'):
            return Response(
                {"error": "Contractor profile already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)