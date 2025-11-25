from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import ActivityLog
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that uses email as the username field"""
    username_field = User.USERNAME_FIELD  # This will be 'email'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), message='A user with this email already exists.')])
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        # Role is intentionally excluded to enforce single-role signup (user).
        fields = ('email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove confirmation field and extract password explicitly so
        # Django's create_user handles hashing and required fields correctly.
        validated_data.pop('password2', None)
        password = validated_data.pop('password')

        email = validated_data.get('email')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        # Force role to USER for all self-service registrations.
        role = User.Role.USER

        # Provide a clear validation error if email is already taken.
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                'email': 'A user with this email already exists.'
            })

        # Create user using create_user so password is hashed and any
        # custom manager logic runs correctly. Pass username too for
        # compatibility with AbstractUser managers.
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password2 = serializers.CharField()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'actor', 'actor_email', 'action', 'target_type', 'target_id', 'meta', 'created_at')
        read_only_fields = ('id', 'actor', 'actor_email', 'action', 'target_type', 'target_id', 'meta', 'created_at')