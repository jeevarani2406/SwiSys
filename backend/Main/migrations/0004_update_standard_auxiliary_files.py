# Generated migration to update StandardFile and AuxiliaryFile models

from django.db import migrations, models
import django.db.models.deletion


def migrate_standardfile_keyin_person(apps, schema_editor):
    """Migrate uploaded_by ForeignKey to Keyin_Person IntegerField"""
    StandardFile = apps.get_model('Main', 'StandardFile')
    for file in StandardFile.objects.all():
        if hasattr(file, 'uploaded_by') and file.uploaded_by:
            file.Keyin_Person = file.uploaded_by.id
            file.save()


def migrate_auxiliaryfile_keyin_person(apps, schema_editor):
    """Migrate uploaded_by ForeignKey to Keyin_Person IntegerField"""
    AuxiliaryFile = apps.get_model('Main', 'AuxiliaryFile')
    for file in AuxiliaryFile.objects.all():
        if hasattr(file, 'uploaded_by') and file.uploaded_by:
            file.Keyin_Person = file.uploaded_by.id
            file.save()


def migrate_auxiliaryfile_title_to_filename(apps, schema_editor):
    """Migrate Title to File_Name"""
    AuxiliaryFile = apps.get_model('Main', 'AuxiliaryFile')
    for file in AuxiliaryFile.objects.all():
        if hasattr(file, 'Title'):
            file.File_Name = file.Title
            file.save()


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0003_category_standardfile_auxiliaryfile'),
    ]

    operations = [
        # StandardFile changes - Add new fields first
        migrations.AddField(
            model_name='standardfile',
            name='Keyin_Person',
            field=models.IntegerField(blank=True, help_text='Logged-in employee ID', null=True),
        ),
        migrations.AddField(
            model_name='standardfile',
            name='Keyin_Date',
            field=models.DateField(blank=True, help_text='Data entry date', null=True),
        ),
        # Migrate data
        migrations.RunPython(migrate_standardfile_keyin_person),
        # Alter fields
        migrations.AlterField(
            model_name='standardfile',
            name='Standard_No',
            field=models.CharField(max_length=60, unique=True),
        ),
        migrations.AlterField(
            model_name='standardfile',
            name='Standard_Name',
            field=models.CharField(max_length=60),
        ),
        migrations.AlterField(
            model_name='standardfile',
            name='Resource',
            field=models.CharField(blank=True, max_length=255),
        ),
        # Remove old fields
        migrations.RemoveField(
            model_name='standardfile',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='standardfile',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='standardfile',
            name='uploaded_by',
        ),
        
        # AuxiliaryFile changes - Rename Title to File_Name first
        migrations.RenameField(
            model_name='auxiliaryfile',
            old_name='Title',
            new_name='File_Name',
        ),
        # Add new fields
        migrations.AddField(
            model_name='auxiliaryfile',
            name='Keyin_Person',
            field=models.IntegerField(blank=True, help_text='Logged-in employee ID', null=True),
        ),
        migrations.AddField(
            model_name='auxiliaryfile',
            name='Keyin_Date',
            field=models.DateField(blank=True, help_text='Data entry date', null=True),
        ),
        migrations.AddField(
            model_name='auxiliaryfile',
            name='Note',
            field=models.TextField(blank=True),
        ),
        # Migrate data
        migrations.RunPython(migrate_auxiliaryfile_keyin_person),
        # Alter File_Name to TextField
        migrations.AlterField(
            model_name='auxiliaryfile',
            name='File_Name',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='auxiliaryfile',
            name='Resource',
            field=models.CharField(blank=True, max_length=255),
        ),
        # Remove old fields
        migrations.RemoveField(
            model_name='auxiliaryfile',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='auxiliaryfile',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='auxiliaryfile',
            name='uploaded_by',
        ),
        migrations.RemoveField(
            model_name='auxiliaryfile',
            name='Category',
        ),
    ]

