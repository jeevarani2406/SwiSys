from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Vehicle(models.Model):
	name = models.CharField(max_length=200)
	brand = models.CharField(max_length=200, blank=True)
	source_file = models.CharField(max_length=512, blank=True)
	excel_file = models.FileField(upload_to='j1939_uploads/%Y/%m/%d/', blank=True, null=True, help_text='Original Excel file for auditing')
	uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	upload_date = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.brand} {self.name}" if self.brand else self.name


class SPN(models.Model):
	spn_number = models.IntegerField(unique=True)
	description = models.CharField(max_length=255, blank=True)

	def __str__(self):
		return f"SPN {self.spn_number}"


class PGN(models.Model):
	pgn_number = models.IntegerField(unique=True)
	description = models.CharField(max_length=255, blank=True)

	def __str__(self):
		return f"PGN {self.pgn_number}"


class VehicleSPN(models.Model):
	vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
	spn = models.ForeignKey(SPN, on_delete=models.CASCADE)
	pgn = models.ForeignKey(PGN, on_delete=models.SET_NULL, null=True, blank=True, help_text='Optional PGN associated with this SPN')
	# store as text to allow both numeric and string; use supported flag
	value = models.TextField(blank=True, null=True)
	supported = models.BooleanField(default=False)

	class Meta:
		unique_together = ('vehicle', 'spn')

	def __str__(self):
		return f"{self.vehicle} - SPN {self.spn.spn_number} ({'supported' if self.supported else 'unsupported'})"


class VehiclePGN(models.Model):
	vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
	pgn = models.ForeignKey(PGN, on_delete=models.CASCADE)

	class Meta:
		unique_together = ('vehicle', 'pgn')

	def __str__(self):
		return f"{self.vehicle} - PGN {self.pgn.pgn_number}"


class StandardFile(models.Model):
	"""Standard J1939 files (e.g., J1939-71, J1939-73, etc.)"""
	Standard_No = models.CharField(max_length=100, unique=True)  # e.g., "J1939-71 MAR2011"
	Standard_Name = models.CharField(max_length=255)
	Issued_Date = models.DateField()
	Revised_Date = models.DateField(null=True, blank=True)
	Resource = models.URLField(blank=True)
	File = models.FileField(upload_to='standard_files/%Y/%m/%d/')
	Note = models.TextField(blank=True)
	uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.Standard_No

	class Meta:
		ordering = ['-created_at']


class Category(models.Model):
	"""Categories for organizing auxiliary files"""
	name = models.CharField(max_length=200, unique=True)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name

	class Meta:
		verbose_name_plural = "Categories"
		ordering = ['name']


class AuxiliaryFile(models.Model):
	"""Auxiliary files linked to standard files"""
	Title = models.CharField(max_length=255)
	Description = models.TextField(blank=True)
	Published_Date = models.DateField()
	Resource = models.URLField(blank=True)
	File = models.FileField(upload_to='auxiliary_files/%Y/%m/%d/')
	Linked_Standard = models.ForeignKey(StandardFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='auxiliary_files')
	Category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
	uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.Title

	class Meta:
		ordering = ['-created_at']
