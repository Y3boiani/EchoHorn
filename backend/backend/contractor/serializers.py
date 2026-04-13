from rest_framework import serializers
from .models import Vehicle, Driver, DriverVehicleAssignment
from accounts.models import User
from accounts.serializers import UserSerializer


class VehicleSerializer(serializers.ModelSerializer):
    contractor_name = serializers.CharField(source='contractor.get_full_name', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'contractor', 'contractor_name', 'registration_number',
            'vehicle_type', 'capacity_weight', 'model_make', 'fuel_type',
            'length_feet', 'width_feet', 'height_feet',
            'gps_device_id', 'current_location',
            'insurance_policy_number', 'insurance_expiry_date',
            'puc_number', 'puc_expiry_date',
            'status', 'current_booking', 'total_trips_completed', 
            'average_rating', 'odometer_reading',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['contractor', 'current_booking', 'total_trips_completed', 
                           'average_rating', 'created_at', 'updated_at']


class DriverSerializer(serializers.ModelSerializer):
    # Get details from related user account
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    
    # Get details from driver profile
    license_number = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    home_region = serializers.SerializerMethodField()
    
    contractor_name = serializers.CharField(source='contractor.get_full_name', read_only=True)
    is_independent = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Driver
        fields = [
            'id', 'user', 'name', 'email', 'phone_number',
            'contractor', 'contractor_name', 'is_independent',
            'license_number', 'years_of_experience', 'home_region',
            'status', 'current_booking',
            'total_trips_completed', 'average_rating', 'efficiency_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['contractor', 'current_booking', 'total_trips_completed',
                           'average_rating', 'efficiency_score', 'created_at', 'updated_at']
    
    def get_license_number(self, obj):
        if hasattr(obj.user, 'driver_profile'):
            return obj.user.driver_profile.license_number
        return None
    
    def get_years_of_experience(self, obj):
        if hasattr(obj.user, 'driver_profile'):
            return obj.user.driver_profile.years_of_experience
        return 0
    
    def get_home_region(self, obj):
        if hasattr(obj.user, 'driver_profile'):
            return obj.user.driver_profile.home_region
        return None


class DriverVehicleAssignmentSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    
    class Meta:
        model = DriverVehicleAssignment
        fields = ['id', 'driver', 'driver_name', 'vehicle', 'vehicle_registration',
                 'assigned_at', 'is_active']
        read_only_fields = ['assigned_at']


# For consumer side - viewing available drivers with their details
class AvailableDriverSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    
    contractor_name = serializers.CharField(source='contractor.get_full_name', read_only=True)
    contractor_type = serializers.SerializerMethodField()
    assigned_vehicles = serializers.SerializerMethodField()
    
    # Driver profile details
    license_number = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    
    class Meta:
        model = Driver
        fields = [
            'id', 'name', 'is_independent', 'contractor_name', 'contractor_type',
            'phone_number', 'license_number', 'years_of_experience',
            'average_rating', 'efficiency_score', 'assigned_vehicles'
        ]
    
    def get_contractor_type(self, obj):
        if hasattr(obj.contractor, 'contractor_profile'):
            return obj.contractor.contractor_profile.contractor_type
        return None
    
    def get_assigned_vehicles(self, obj):
        active_assignments = obj.vehicle_assignments.filter(is_active=True)
        vehicles = [assignment.vehicle for assignment in active_assignments]
        return VehicleSerializer(vehicles, many=True).data
    
    def get_license_number(self, obj):
        if hasattr(obj.user, 'driver_profile'):
            return obj.user.driver_profile.license_number
        return None
    
    def get_years_of_experience(self, obj):
        if hasattr(obj.user, 'driver_profile'):
            return obj.user.driver_profile.years_of_experience
        return 0