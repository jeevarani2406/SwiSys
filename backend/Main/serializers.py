from rest_framework import serializers
from .models import Vehicle, SPN, PGN, VehicleSPN, VehiclePGN, StandardFile, AuxiliaryFile, Category, J1939ParameterDefinition


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'


class SPNSerializer(serializers.ModelSerializer):
    class Meta:
        model = SPN
        fields = '__all__'


class PGNSerializer(serializers.ModelSerializer):
    class Meta:
        model = PGN
        fields = '__all__'


class VehicleSPNSerializer(serializers.ModelSerializer):
    spn = serializers.IntegerField(source='spn.spn_number')
    description = serializers.CharField(source='spn.description', read_only=True)

    class Meta:
        model = VehicleSPN
        fields = ['spn', 'description', 'supported', 'value']


class VehicleSummarySerializer(serializers.ModelSerializer):
    pgns = serializers.IntegerField()
    spns = serializers.IntegerField()
    source_file = serializers.CharField()

    class Meta:
        model = Vehicle
        fields = ['id', 'name', 'brand', 'pgns', 'spns', 'source_file']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']


class StandardFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardFile
        fields = [
            'id', 'Standard_No', 'Standard_Name', 'Issued_Date', 
            'Revised_Date', 'Resource', 'File', 'Note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AuxiliaryFileSerializer(serializers.ModelSerializer):
    Linked_Standard_No = serializers.CharField(source='Linked_Standard.Standard_No', read_only=True)
    
    class Meta:
        model = AuxiliaryFile
        fields = [
            'id', 'Title', 'Description', 'Published_Date', 'Resource', 
            'File', 'Linked_Standard', 'Linked_Standard_No', 'Category', 
            'Note', 'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class J1939ParameterDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for J1939 Parameter Definitions"""
    standard_reference_name = serializers.CharField(
        source='Standard_Reference.Standard_No', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = J1939ParameterDefinition
        fields = [
            'SPN_Number', 'PGN_DEC', 'PGN_HEX', 'SPN_Description', 'Unit',
            'Data_Length_Bytes', 'Start_Byte', 'Start_Bit', 'Bit_Length',
            'Resolution', 'Offset', 'Min_Value', 'Max_Value',
            'Standard_Reference', 'standard_reference_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SPNDecodeRequestSerializer(serializers.Serializer):
    """Serializer for SPN decode requests"""
    spn_number = serializers.IntegerField(help_text='SPN number to decode')
    raw_data = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=255),
        min_length=8,
        max_length=8,
        help_text='8 bytes of raw CAN message data'
    )


class SPNDecodeResponseSerializer(serializers.Serializer):
    """Serializer for SPN decode responses"""
    spn = serializers.IntegerField()
    description = serializers.CharField()
    physical_value = serializers.FloatField(allow_null=True)
    unit = serializers.CharField()
    status = serializers.CharField()
    raw_value = serializers.IntegerField(allow_null=True)
    message = serializers.CharField(required=False, allow_null=True)


class UniqueSPNCountSerializer(serializers.Serializer):
    """Serializer for unique SPN count response"""
    count = serializers.IntegerField()
    unique_spns = serializers.ListField(child=serializers.IntegerField())
    spn_details = serializers.ListField(child=serializers.DictField())
    spn_occurrences = serializers.DictField()
