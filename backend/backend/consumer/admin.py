from django.contrib import admin
from .models import ServiceRequest, Booking, Rating

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'cargo_type', 'vehicle_type_preference', 'status', 'created_at']
    list_filter = ['cargo_type', 'vehicle_type_preference', 'status', 'service_type']
    search_fields = ['customer__email', 'pickup_address', 'drop_address']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'contractor', 'final_price', 'advance_paid', 'full_payment_paid', 'status']
    list_filter = ['status', 'advance_paid', 'full_payment_paid']
    search_fields = ['driver__user__email', 'contractor__email']

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['booking', 'rated_by', 'rated_user', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['rated_by__email', 'rated_user__email']