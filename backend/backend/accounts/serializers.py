from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, ConsumerProfile, ContractorProfile


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
        
        if attrs['user_type'] not in ['consumer', 'contractor']:
            raise serializers.ValidationError({"user_type": "Invalid user type."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create profile based on user type
        if user.user_type == 'consumer':
            ConsumerProfile.objects.create(user=user)
        elif user.user_type == 'contractor':
            # Contractor profile will be completed later
            pass
        
        return user


class ConsumerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumerProfile
        fields = '__all__'
        read_only_fields = ('user',)


class ContractorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractorProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_verified', 'verified_at', 
                           'total_vehicles', 'total_drivers', 'average_rating')


class UserSerializer(serializers.ModelSerializer):
    consumer_profile = ConsumerProfileSerializer(read_only=True)
    contractor_profile = ContractorProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 
                  'user_type', 'is_email_verified', 'is_phone_verified', 
                  'consumer_profile', 'contractor_profile', 'created_at')
        read_only_fields = ('id', 'is_email_verified', 'is_phone_verified', 'created_at')