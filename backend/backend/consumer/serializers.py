from rest_framework import serializers
from .models import ServiceRequest, Booking, Rating
from contractor.serializers import DriverSerializer, VehicleSerializer


class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'customer_name', 'service_type',
            'pickup_address', 'pickup_floor_number', 'pickup_lift_available', 'pickup_parking_available',
            'drop_address', 'drop_floor_number', 'drop_lift_available', 'drop_parking_available',
            'cargo_type', 'cargo_weight', 'room_count', 'packing_needed',
            'vehicle_type_preference', 'pickup_datetime', 'special_notes',
            'ml_suggested_vehicle_type', 'ml_suggested_price',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'ml_suggested_vehicle_type', 'ml_suggested_price',
                           'status', 'created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    service_request_details = ServiceRequestSerializer(source='service_request', read_only=True)
    driver_details = DriverSerializer(source='driver', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    contractor_name = serializers.CharField(source='contractor.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'service_request', 'service_request_details', 'driver', 'driver_details',
            'contractor', 'contractor_name', 'vehicle', 'vehicle_details',
            'final_price', 'advance_percentage', 'advance_paid', 'advance_amount',
            'full_payment_paid', 'payment_date', 'status',
            'booking_confirmed_at', 'trip_started_at', 'trip_completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['advance_amount', 'booking_confirmed_at', 'trip_started_at',
                           'trip_completed_at', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['service_request', 'driver', 'contractor', 'vehicle', 'final_price']
    
    def validate(self, attrs):
        # Check if driver is available
        driver = attrs.get('driver')
        if driver.status != 'available':
            raise serializers.ValidationError("Selected driver is not available")
        
        # Check if vehicle is available
        vehicle = attrs.get('vehicle')
        if vehicle.status != 'available':
            raise serializers.ValidationError("Selected vehicle is not available")
        
        # Check if service request is still pending
        service_request = attrs.get('service_request')
        if service_request.status != 'pending':
            raise serializers.ValidationError("This service request is no longer available")
        
        return attrs


class RatingSerializer(serializers.ModelSerializer):
    rated_by_name = serializers.CharField(source='rated_by.get_full_name', read_only=True)
    rated_user_name = serializers.CharField(source='rated_user.get_full_name', read_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'booking', 'rated_by', 'rated_by_name',
            'rated_user', 'rated_user_name', 'rating', 'review', 'created_at'
        ]
        read_only_fields = ['rated_by', 'created_at']