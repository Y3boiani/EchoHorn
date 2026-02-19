from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email as username"""
    
    USER_TYPE_CHOICES = (
        ('consumer', 'Consumer'),
        ('contractor', 'Contractor'),
    )
    
    email = models.EmailField(unique=True, max_length=255)
    phone_number = PhoneNumberField(blank=True, null=True, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    # Verification
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'user_type']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class ConsumerProfile(models.Model):
    """Profile for consumers who need logistics services"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consumer_profile')
    company_name = models.CharField(max_length=255, blank=True)
    is_business = models.BooleanField(default=False)
    
    # Business details (optional)
    gst_number = models.CharField(max_length=15, blank=True)
    business_address = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Consumer: {self.user.get_full_name()}"


class ContractorProfile(models.Model):
    """Profile for contractors who provide vehicles/drivers"""
    
    CONTRACTOR_TYPE_CHOICES = (
        ('individual', 'Individual'),
        ('company', 'Company'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contractor_profile')
    contractor_type = models.CharField(max_length=20, choices=CONTRACTOR_TYPE_CHOICES)
    
    # Company details (required for companies)
    company_name = models.CharField(max_length=255, blank=True)
    company_registration_number = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    
    # Address
    business_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    
    # Documents
    pan_card = models.ImageField(upload_to='contractor_docs/pan/', blank=True)
    registration_certificate = models.ImageField(upload_to='contractor_docs/registration/', blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Stats
    total_vehicles = models.IntegerField(default=0)
    total_drivers = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.contractor_type == 'company':
            return f"Contractor: {self.company_name}"
        return f"Contractor: {self.user.get_full_name()}"