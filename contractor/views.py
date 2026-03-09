from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Vehicle, Driver, DriverVehicleAssignment
from .serializers import (
    VehicleSerializer, DriverSerializer,
    DriverVehicleAssignmentSerializer
)
from accounts.models import User


class VehicleListCreateView(generics.ListCreateAPIView):
    """List all vehicles or create new vehicle for contractor"""
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Contractor sees only their vehicles
        return Vehicle.objects.filter(contractor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(contractor=self.request.user)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific vehicle"""
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Vehicle.objects.filter(contractor=self.request.user)


class DriverListView(generics.ListAPIView):
    """List all drivers managed by this contractor"""
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Contractor sees only their drivers
        return Driver.objects.filter(contractor=self.request.user)


class DriverDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific driver"""
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Driver.objects.filter(contractor=self.request.user)


class AddFleetDriverView(generics.CreateAPIView):
    """
    Contractor adds a driver to their fleet.
    This creates a Driver record linked to an existing driver user account.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only contractors can add fleet drivers
        if request.user.user_type != 'contractor':
            return Response(
                {"error": "Only contractors can add fleet drivers"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        driver_user_id = request.data.get('driver_user_id')
        
        if not driver_user_id:
            return Response(
                {"error": "driver_user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the driver user
        try:
            driver_user = User.objects.get(id=driver_user_id, user_type='driver')
        except User.DoesNotExist:
            return Response(
                {"error": "Driver user not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if driver already has a Driver account
        if hasattr(driver_user, 'driver_account'):
            return Response(
                {"error": "This driver is already registered in the system"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Driver record
        driver = Driver.objects.create(
            user=driver_user,
            contractor=request.user
        )
        
        serializer = DriverSerializer(driver)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RegisterAsIndependentDriverView(generics.CreateAPIView):
    """
    Driver registers themselves as independent (self-managed).
    Creates Driver record where contractor = user (self).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only drivers can register as independent
        if request.user.user_type != 'driver':
            return Response(
                {"error": "Only driver accounts can register as independent drivers"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if driver already has a Driver account
        if hasattr(request.user, 'driver_account'):
            return Response(
                {"error": "You are already registered as a driver"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if driver profile is complete
        if not hasattr(request.user, 'driver_profile'):
            return Response(
                {"error": "Please complete your driver profile first"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Driver record (self-managed: contractor = user)
        driver = Driver.objects.create(
            user=request.user,
            contractor=request.user  # Independent driver
        )
        
        serializer = DriverSerializer(driver)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssignDriverToVehicleView(generics.CreateAPIView):
    """Assign a driver to a vehicle"""
    serializer_class = DriverVehicleAssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        driver_id = request.data.get('driver')
        vehicle_id = request.data.get('vehicle')
        
        # Verify driver and vehicle belong to this contractor
        driver = get_object_or_404(Driver, id=driver_id, contractor=request.user)
        vehicle = get_object_or_404(Vehicle, id=vehicle_id, contractor=request.user)
        
        # Create new assignment
        assignment = DriverVehicleAssignment.objects.create(
            driver=driver,
            vehicle=vehicle,
            is_active=True
        )
        
        serializer = self.get_serializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DriverVehicleAssignmentListView(generics.ListAPIView):
    """List all driver-vehicle assignments"""
    serializer_class = DriverVehicleAssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DriverVehicleAssignment.objects.filter(
            driver__contractor=self.request.user
        )