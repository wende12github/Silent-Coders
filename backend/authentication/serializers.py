from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserSkill, User
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
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'email','full_name','profile_picture','user_skills',
            'availability', 'is_booked_for', 'full_name']
        read_only_fields = ('id',)

    def get_user(self, obj):
        # This will return all the user fields as needed (can be customized)
        return {
            'id': obj.id,
            'username': obj.username,
            'email': obj.email,
            'full_name': f"{obj.first_name} {obj.last_name}",
            'profile_picture': obj.profile_picture.url if obj.profile_picture else None,
            'bio': obj.bio,
            'date_joined': obj.date_joined,
        }
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    

class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['id', 'user', 'skill', 'level', 'endorsements', 'experience_hours']
        read_only_fields = ['endorsements', 'user']


class TokenObtainPairSerializer(TokenObtainPairSerializer):
    pass
