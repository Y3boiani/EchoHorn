from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ConsumerProfile, ContractorProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number')}),
        ('Type', {'fields': ('user_type',)}),
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'user_type'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')


@admin.register(ConsumerProfile)
class ConsumerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'is_business', 'created_at')
    search_fields = ('user__email', 'company_name')
    list_filter = ('is_business',)


@admin.register(ContractorProfile)
class ContractorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'contractor_type', 'company_name', 'is_verified', 'total_vehicles', 'average_rating')
    search_fields = ('user__email', 'company_name')
    list_filter = ('contractor_type', 'is_verified', 'city', 'state')
    readonly_fields = ('total_vehicles', 'total_drivers', 'average_rating', 'created_at', 'updated_at')