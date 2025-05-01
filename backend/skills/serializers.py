
from rest_framework import serializers
from .models import ServiceOffering, Skill,ServiceRequest

class ServiceOfferingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOffering
        fields = ['id', 'user', 'skill', 'title', 'description', 'duration_in_minutes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at']  # Prevent modification of these fields
    def validate(self, data):
        if ServiceOffering.objects.filter(user=self.context['request'].user, title=data['title']).exists():
            raise serializers.ValidationError("You already have a service offering with this title.")
        return data



class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']
        read_only_fields = ['id']
        
        
class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ['id', 'user', 'skill', 'title', 'description', 'duration_in_minutes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at','status'] 
    def validate(self, data):
        if ServiceRequest.objects.filter(user=self.context['request'].user, title=data['title']).exists():
            raise serializers.ValidationError("You already have a service request with this title.")
        return data