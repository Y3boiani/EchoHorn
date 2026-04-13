from django.urls import path
from .views import (
    VehicleListCreateView, VehicleDetailView,
    DriverListView, DriverDetailView,
    AddFleetDriverView, RegisterAsIndependentDriverView,
    AssignDriverToVehicleView, DriverVehicleAssignmentListView
)

urlpatterns = [
    # Vehicle management
    path('vehicles/', VehicleListCreateView.as_view(), name='vehicle_list_create'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle_detail'),
    
    # Driver management
    path('drivers/', DriverListView.as_view(), name='driver_list'),
    path('drivers/<int:pk>/', DriverDetailView.as_view(), name='driver_detail'),
    path('drivers/add-fleet-driver/', AddFleetDriverView.as_view(), name='add_fleet_driver'),
    path('drivers/register-independent/', RegisterAsIndependentDriverView.as_view(), name='register_independent_driver'),
    
    # Driver-Vehicle assignment
    path('assignments/', DriverVehicleAssignmentListView.as_view(), name='assignment_list'),
    path('assign-driver/', AssignDriverToVehicleView.as_view(), name='assign_driver'),
]