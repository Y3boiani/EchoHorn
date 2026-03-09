from django.db import models
from django.conf import settings


class Vehicle(models.Model):
    VEHICLE_TYPE_CHOICES = [
        ('mini_truck', 'Mini Truck'),
        ('medium_truck', 'Medium Truck'),
        ('full_truck', 'Full Truck'),
        ('trailer', 'Trailer'),
        ('tempo', 'Tempo'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
    ]
    
    FUEL_TYPE_CHOICES = [
        ('diesel', 'Diesel'),
        ('cng', 'CNG'),
        ('electric', 'Electric'),
    ]
    
    contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='vehicles'
    )
    
    # Basic Info
    registration_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    capacity_weight = models.DecimalField(max_digits=10, decimal_places=2, help_text="Payload capacity in tons")
    model_make = models.CharField(max_length=100)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, default='diesel')
    
    # Dimensions
    length_feet = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    width_feet = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_feet = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # GPS & Location
    gps_device_id = models.CharField(max_length=100, blank=True, help_text="GPS tracker device ID")
    current_location = models.CharField(max_length=200, blank=True, help_text="Last known city/region")
    
    # Documents
    insurance_policy_number = models.CharField(max_length=100, blank=True)
    insurance_expiry_date = models.DateField(null=True, blank=True)
    puc_number = models.CharField(max_length=50, blank=True, help_text="Pollution certificate number")
    puc_expiry_date = models.DateField(null=True, blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_booking = models.ForeignKey(
        'consumer.Booking', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_vehicle'
    )
    
    # Stats
    total_trips_completed = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    odometer_reading = models.IntegerField(default=0, help_text="Current odometer reading in KM")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.registration_number} - {self.vehicle_type}"


class Driver(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('inactive', 'Inactive'),
    ]
    
    # Every driver MUST have a user account
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driver_account'
    )
    
    # If this driver is managed by a contractor (fleet), contractor field is set
    # If driver is independent, contractor = user (self-managed)
    contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_drivers',
        help_text="Contractor managing this driver. For independent drivers, this equals user."
    )
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_booking = models.ForeignKey(
        'consumer.Booking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_driver'
    )
    
    # Stats
    total_trips_completed = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    efficiency_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="ML-calculated efficiency metric"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    @property
    def is_independent(self):
        """Check if driver is independent (self-managed) or fleet driver"""
        return self.contractor == self.user
    
    @property
    def name(self):
        """Get driver name from user account"""
        return self.user.get_full_name()
    
    @property
    def license_number(self):
        """Get license number from driver profile"""
        if hasattr(self.user, 'driver_profile'):
            return self.user.driver_profile.license_number
        return None
    
    @property
    def phone_number(self):
        """Get phone from user account"""
        return self.user.phone_number
    
    def __str__(self):
        indie = " (Independent)" if self.is_independent else ""
        return f"{self.name}{indie}"


class DriverVehicleAssignment(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='vehicle_assignments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='driver_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.driver.name} → {self.vehicle.registration_number}"