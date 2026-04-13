from django.contrib import admin
from .models import Vehicle, Driver, DriverVehicleAssignment

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'vehicle_type', 'contractor', 'status', 'total_trips_completed', 'average_rating']
    list_filter = ['vehicle_type', 'status', 'fuel_type']
    search_fields = ['registration_number', 'contractor__email']

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'contractor', 'status', 'total_trips_completed', 'average_rating']
    list_filter = ['status']
    search_fields = ['user__email', 'contractor__email']

@admin.register(DriverVehicleAssignment)
class DriverVehicleAssignmentAdmin(admin.ModelAdmin):
    list_display = ['driver', 'vehicle', 'is_active', 'assigned_at']
    list_filter = ['is_active']