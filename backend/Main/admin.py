from django.contrib import admin
from .models import StandardFile, AuxiliaryFile, Vehicle, SPN, PGN, VehicleSPN, VehiclePGN, Category


@admin.register(StandardFile)
class StandardFileAdmin(admin.ModelAdmin):
    list_display = ['Standard_No', 'Standard_Name', 'Issued_Date', 'Revised_Date', 'uploaded_by', 'created_at']
    list_filter = ['Issued_Date', 'created_at']
    search_fields = ['Standard_No', 'Standard_Name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(AuxiliaryFile)
class AuxiliaryFileAdmin(admin.ModelAdmin):
    list_display = ['Title', 'Published_Date', 'Linked_Standard', 'Category', 'uploaded_by', 'created_at']
    list_filter = ['Published_Date', 'Category', 'created_at']
    search_fields = ['Title', 'Description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'source_file', 'upload_date']
    search_fields = ['name', 'brand']


@admin.register(SPN)
class SPNAdmin(admin.ModelAdmin):
    list_display = ['spn_number', 'description']
    search_fields = ['spn_number', 'description']


@admin.register(PGN)
class PGNAdmin(admin.ModelAdmin):
    list_display = ['pgn_number', 'description']
    search_fields = ['pgn_number', 'description']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
