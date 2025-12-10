from rest_framework import serializers
from .models import Vehicle, SPN, PGN, VehicleSPN, VehiclePGN, StandardFile, AuxiliaryFile, Category


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
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
