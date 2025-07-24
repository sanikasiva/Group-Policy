# policies/serializers.py

from rest_framework import serializers
from .models import Category, Parameter, ConfigSegment, Value, ConfigType, SessionRecord

class SessionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRecord
        fields = ['session_id', 'file_content']

class ValueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Value
        fields = ['id', 'state', 'value', 'value_number']

class ConfigSegmentSerializer(serializers.ModelSerializer):
    # Remove the old `values = ValueSerializer(many=True)` which assumed segment FK.
    # Instead, fetch values by config_type of the parent parameter.
    values = serializers.SerializerMethodField()

    class Meta:
        model  = ConfigSegment
        fields = [
            'id', 'seg_name', 'default_text',
            'is_value_slot', 'position', 'line',
            'values'   # now computed
        ]

    def get_values(self, segment):
        """
        Return all Value rows whose config_type matches
        this segment’s parameter.config_type.
        """
        config_type = segment.parameter.config_type
        qs = Value.objects.filter(config_type=config_type)
        return ValueSerializer(qs, many=True).data

class ConfigTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConfigType
        fields = ['id', 'name', 'description']

class ParameterSerializer(serializers.ModelSerializer):
    config_type = ConfigTypeSerializer(read_only=True)
    segments    = ConfigSegmentSerializer(many=True, read_only=True)

    class Meta:
        model  = Parameter
        fields = [
            'id','name','best_practice',
            'min_value','max_value',
            'config_type','segments'
        ]

class CategorySerializer(serializers.ModelSerializer):
    params = ParameterSerializer(many=True, read_only=True)

    class Meta:
        model  = Category
        fields = ['id','name','params']
