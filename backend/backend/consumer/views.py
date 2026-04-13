from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from .models import ServiceRequest, Booking, Rating
from .serializers import (
    ServiceRequestSerializer, BookingSerializer,
    BookingCreateSerializer, RatingSerializer
)
from contractor.models import Driver
from contractor.serializers import AvailableDriverSerializer


class ServiceRequestCreateView(generics.CreateAPIView):
    """Customer creates a service request"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        service_request = serializer.save(customer=self.request.user)
        
        # TODO: Call ML model here to get suggestions
        # For now, just save the request
        # ml_result = call_ml_model(service_request)
        # service_request.ml_suggested_vehicle_type = ml_result['vehicle_type']
        # service_request.ml_suggested_price = ml_result['price']
        # service_request.save()


class ServiceRequestListView(generics.ListAPIView):
    """List all service requests by customer"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ServiceRequest.objects.filter(customer=self.request.user)


class ServiceRequestDetailView(generics.RetrieveAPIView):
    """Get specific service request details"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ServiceRequest.objects.filter(customer=self.request.user)


class AvailableDriversView(APIView):
    """Get list of available drivers with ratings and pricing"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, service_request_id):
        # Get the service request
        try:
            service_request = ServiceRequest.objects.get(
                id=service_request_id,
                customer=request.user
            )
        except ServiceRequest.DoesNotExist:
            return Response(
                {"error": "Service request not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get available drivers (matching vehicle type preference)
        available_drivers = Driver.objects.filter(
            status='available',
            vehicle_assignments__vehicle__vehicle_type=service_request.vehicle_type_preference,
            vehicle_assignments__is_active=True,
            vehicle_assignments__vehicle__status='available'
        ).distinct()
        
        serializer = AvailableDriverSerializer(available_drivers, many=True)
        
        # Add ML suggested price to response (for now, use ml_suggested_price from request)
        response_data = {
            'service_request_id': service_request.id,
            'ml_suggested_price': service_request.ml_suggested_price,
            'available_drivers': serializer.data
        }
        
        return Response(response_data)


class BookingCreateView(generics.CreateAPIView):
    """Customer creates a booking by selecting a driver"""
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create booking
        booking = serializer.save()
        
        # Update service request status
        booking.service_request.status = 'driver_selected'
        booking.service_request.save()
        
        # Return full booking details
        response_serializer = BookingSerializer(booking)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class BookingListView(generics.ListAPIView):
    """List all bookings for customer"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(service_request__customer=self.request.user)


class BookingDetailView(generics.RetrieveAPIView):
    """Get specific booking details"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(service_request__customer=self.request.user)


class BookingPayAdvanceView(APIView):
    """Mark advance payment as paid"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                service_request__customer=request.user
            )
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.advance_paid:
            return Response(
                {"error": "Advance already paid"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark advance as paid
        booking.advance_paid = True
        booking.status = 'awaiting_acceptance'
        booking.service_request.status = 'payment_pending'
        booking.save()
        booking.service_request.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class BookingPayFullView(APIView):
    """Mark full payment as paid"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                service_request__customer=request.user
            )
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not booking.advance_paid:
            return Response(
                {"error": "Advance payment not completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.full_payment_paid:
            return Response(
                {"error": "Full payment already completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark full payment as paid
        booking.full_payment_paid = True
        booking.payment_date = timezone.now()
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class RatingCreateView(generics.CreateAPIView):
    """Customer rates a driver/contractor after trip completion"""
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(rated_by=self.request.user)