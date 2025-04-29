from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'bio', 'profile_picture', 
                  'date_joined')
        read_only_fields = ('id', 'date_joined')
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
 

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'bio', 'profile_picture')
        read_only_fields = ('id',)