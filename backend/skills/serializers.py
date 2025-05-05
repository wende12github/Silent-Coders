from rest_framework import serializers
from .models import Skill

class SkillSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Skill
        fields = [
            'id',
            'user',
            'name',
            'description',
            'is_offered',
            'location',
            'address',
            'tags',
            'is_visible',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
