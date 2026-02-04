from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserSkill, User, EmailNotificationPreference
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'bio', 'profile_picture', 
        'date_joined', 'first_name', 'last_name')
        read_only_fields = ('id', 'date_joined')
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField() # Use email for authentication
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '')
        password = data.get('password', '')

        if email and password:
            user = authenticate(email=email, password=password) # Use email for authentication
            if user:
                return user
            else:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'email','profile_picture','user_skills',
            'availability', 'last_name', 'first_name']

        read_only_fields = ('id',)

    def get_user(self, obj):
        # This will return all the user fields as needed (can be customized)
        return {
            'id': obj.id,
            'username': obj.username,
            'email': obj.email,
            'first_name': f"{obj.first_name}",
            'last_name': f"{obj.last_name}",
            'profile_picture': obj.profile_picture.url if obj.profile_picture else None,
            'bio': obj.bio,
            'date_joined': obj.date_joined,
        }
    
    def get_first_name(self, obj):
        return f"{obj.first_name}".strip()
    def get_last_name(self, obj):
        return f"{obj.last_name}".strip()
    

class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['id', 'user', 'skill', 'level', 'endorsements', 'experience_hours', 'name', 'location', 'address']
        read_only_fields = ['endorsements', 'user']

class PublicUserSerializer(serializers.ModelSerializer):
    user_skills = UserSkillSerializer(many=True, read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'profile_picture', 'bio', 'user_skills'
        ]
    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None  
   

class TokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not getattr(user, 'email_verified', False):
            raise serializers.ValidationError('Email address not verified.')
        return data


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)  
    class Meta:
        model = User

        fields = ['username', 'first_name', 'last_name', 'email', 'bio',
                  'availability', 'profile_picture']
        extra_kwargs = {field: {'required': False} for field in fields}


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class EmailPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotificationPreference
        fields = ['newsletter', 'updates', 'skill_match_alerts']

