from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import uuid
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ActivityLogSerializer,
    EmailTokenObtainPairSerializer,
)
from .models import PasswordReset, ActivityLog, User

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailTokenObtainPairSerializer

class PasswordResetView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            token = uuid.uuid4().hex
            expires_at = timezone.now() + timedelta(hours=24)
            
            PasswordReset.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )
            
            # TODO: Send email with reset link
            # For now, just return the token for testing
            return Response({
                "message": "Password reset email sent",
                "token": token  # Remove this in production
            })
        except User.DoesNotExist:
            return Response({
                "message": "If a user with this email exists, they will receive a password reset link."
            })

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            reset = PasswordReset.objects.get(
                token=serializer.validated_data['token'],
                used=False
            )
            
            if reset.is_valid():
                user = reset.user
                user.set_password(serializer.validated_data['password'])
                user.save()
                
                reset.used = True
                reset.save()
                
                return Response({"message": "Password has been reset"})
            else:
                return Response(
                    {"error": "Reset token has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except PasswordReset.DoesNotExist:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset.order_by('-date_joined')

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        # create user with temporary password if not supplied (admin flow)
        password = self.request.data.get('password') or 'TempPass123!'
        user = serializer.save(username=serializer.validated_data.get('email'))
        user.set_password(password)
        user.save()
        ActivityLog.objects.create(
            actor=self.request.user,
            action='user_created',
            target_type='user',
            target_id=str(user.pk),
            meta={'email': user.email, 'role': user.role}
        )

    def perform_update(self, serializer):
        user = serializer.save()
        ActivityLog.objects.create(
            actor=self.request.user,
            action='user_updated',
            target_type='user',
            target_id=str(user.pk),
            meta={'email': user.email, 'role': user.role}
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            actor=self.request.user,
            action='user_deleted',
            target_type='user',
            target_id=str(instance.pk),
            meta={'email': instance.email, 'role': instance.role}
        )
        instance.delete()

class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None  # Return latest N without pagination simplicity

    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', 200))
        return ActivityLog.objects.all().order_by('-created_at')[:limit]