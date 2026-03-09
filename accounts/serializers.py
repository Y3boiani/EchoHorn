from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, CustomerProfile, DriverProfile, ContractorProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 
                  'phone_number', 'user_type')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if attrs['user_type'] not in ['customer', 'driver', 'contractor']:
            raise serializers.ValidationError({"user_type": "Invalid user type."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create profile based on user type
        if user.user_type == 'customer':
            CustomerProfile.objects.create(user=user)
        # Driver and Contractor profiles need to be completed separately
        
        return user


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = '__all__'
        read_only_fields = ('user',)


class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = ('user',)


class ContractorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractorProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_verified', 'verified_at', 
                           'total_vehicles', 'total_drivers', 'average_rating')


class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    driver_profile = DriverProfileSerializer(read_only=True)
    contractor_profile = ContractorProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 
                  'user_type', 'is_email_verified', 'is_phone_verified', 
                  'customer_profile', 'driver_profile', 'contractor_profile', 'created_at')
        read_only_fields = ('id', 'is_email_verified', 'is_phone_verified', 'created_at')