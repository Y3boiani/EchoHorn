from django.urls import path
from .views import (
    ServiceRequestCreateView, ServiceRequestListView, ServiceRequestDetailView,
    AvailableDriversView, BookingCreateView, BookingListView, BookingDetailView,
    BookingPayAdvanceView, BookingPayFullView, RatingCreateView
)

urlpatterns = [
    # Service Requests
    path('requests/', ServiceRequestCreateView.as_view(), name='service_request_create'),
    path('requests/list/', ServiceRequestListView.as_view(), name='service_request_list'),
    path('requests/<int:pk>/', ServiceRequestDetailView.as_view(), name='service_request_detail'),
    
    # Available Drivers
    path('requests/<int:service_request_id>/drivers/', AvailableDriversView.as_view(), name='available_drivers'),
    
    # Bookings
    path('bookings/', BookingCreateView.as_view(), name='booking_create'),
    path('bookings/list/', BookingListView.as_view(), name='booking_list'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    
    # Payments
    path('bookings/<int:booking_id>/pay-advance/', BookingPayAdvanceView.as_view(), name='pay_advance'),
    path('bookings/<int:booking_id>/pay-full/', BookingPayFullView.as_view(), name='pay_full'),
    
    # Ratings
    path('ratings/', RatingCreateView.as_view(), name='rating_create'),
]