from django.db import models
from django.conf import settings


class ServiceRequest(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('local', 'Local Shifting'),
        ('intercity', 'Intercity'),
        ('office', 'Office Relocation'),
        ('single_item', 'Single Item Delivery'),
    ]
    
    CARGO_TYPE_CHOICES = [
        ('electronics', 'Electronics'),
        ('furniture', 'Furniture'),
        ('food', 'Food/Perishables'),
        ('construction', 'Construction Materials'),
        ('textiles', 'Textiles/Clothing'),
        ('general', 'General Cargo'),
    ]
    
    VEHICLE_TYPE_CHOICES = [
        ('mini_truck', 'Mini Truck'),
        ('medium_truck', 'Medium Truck'),
        ('full_truck', 'Full Truck'),
        ('trailer', 'Trailer'),
        ('tempo', 'Tempo'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('driver_selected', 'Driver Selected'),
        ('payment_pending', 'Payment Pending'),
        ('confirmed', 'Confirmed'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    
    # Service Type
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    
    # Pickup Details
    pickup_address = models.TextField()
    pickup_floor_number = models.IntegerField(null=True, blank=True)
    pickup_lift_available = models.BooleanField(default=False)
    pickup_parking_available = models.BooleanField(default=False)
    
    # Drop Details
    drop_address = models.TextField()
    drop_floor_number = models.IntegerField(null=True, blank=True)
    drop_lift_available = models.BooleanField(default=False)
    drop_parking_available = models.BooleanField(default=False)
    
    # Cargo Details
    cargo_type = models.CharField(max_length=50, choices=CARGO_TYPE_CHOICES)
    cargo_weight = models.DecimalField(max_digits=10, decimal_places=2, help_text="Estimated weight in KG")
    room_count = models.IntegerField(null=True, blank=True, help_text="Number of rooms")
    packing_needed = models.BooleanField(default=False)
    
    # Vehicle & Timing
    vehicle_type_preference = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    pickup_datetime = models.DateTimeField()
    special_notes = models.TextField(blank=True)
    
    # ML suggestions (filled later by ML model)
    ml_suggested_vehicle_type = models.CharField(
        max_length=20, 
        choices=VEHICLE_TYPE_CHOICES,
        null=True,
        blank=True
    )
    ml_suggested_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Request #{self.id} - {self.customer.email}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('awaiting_acceptance', 'Awaiting Acceptance'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    service_request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name='booking'
    )
    
    # Assignment
    driver = models.ForeignKey(
        'contractor.Driver',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_received'
    )
    vehicle = models.ForeignKey(
        'contractor.Vehicle',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    
    # Pricing
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    advance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.00,
        help_text="Advance payment percentage"
    )
    advance_paid = models.BooleanField(default=False)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    full_payment_paid = models.BooleanField(default=False)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='awaiting_acceptance')
    
    # Timestamps
    booking_confirmed_at = models.DateTimeField(null=True, blank=True)
    trip_started_at = models.DateTimeField(null=True, blank=True)
    trip_completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-calculate advance amount
        if self.final_price and self.advance_percentage:
            self.advance_amount = (self.final_price * self.advance_percentage) / 100
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.driver.name}"


class Rating(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    rated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    rated_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    review = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['booking', 'rated_by', 'rated_user']
    
    def __str__(self):
        return f"{self.rating}⭐ by {self.rated_by.email} for {self.rated_user.email}"