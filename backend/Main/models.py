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
	Title = models.CharField(max_length=255, default='Untitled')
	Description = models.TextField(blank=True)
	Published_Date = models.DateField()
	Resource = models.URLField(blank=True)
	File = models.FileField(upload_to='auxiliary_files/%Y/%m/%d/')
	Linked_Standard = models.ForeignKey(StandardFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='auxiliary_files')
	Category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
	Note = models.TextField(blank=True)  # Notes for the auxiliary file
	uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.Title

	class Meta:
		ordering = ['-created_at']


class J1939ParameterDefinition(models.Model):
	"""
	J1939 Parameter Definitions - Static lookup table for decoding SPN values
	Based on SAE J1939-71 standard
	
	Fields explained:
	- Start_Byte: The byte position (1-8) where the SPN data begins in the CAN message
	- Start_Bit: The bit position (0-7) within the start byte where the SPN data begins
	- Bit_Length: Total number of bits used to represent the SPN value
	"""
	SPN_Number = models.IntegerField(primary_key=True, help_text='Suspect Parameter Number (unique identifier)')
	PGN_DEC = models.IntegerField(help_text='Parameter Group Number in decimal format')
	PGN_HEX = models.CharField(max_length=10, blank=True, help_text='Parameter Group Number in hexadecimal format')
	SPN_Description = models.CharField(max_length=255, help_text='Human-readable description of the parameter')
	Unit = models.CharField(max_length=50, help_text='Unit of measurement (e.g., km/h, %, L, s)')
	Data_Length_Bytes = models.IntegerField(help_text='Number of bytes used for this SPN')
	Start_Byte = models.IntegerField(help_text='Starting byte position in CAN message (1-8)')
	Start_Bit = models.IntegerField(default=0, help_text='Starting bit position within the byte (0-7)')
	Bit_Length = models.IntegerField(help_text='Total number of bits for this SPN value')
	Resolution = models.FloatField(help_text='Scaling factor (multiply raw value by this)')
	Offset = models.FloatField(default=0.0, help_text='Offset to add after scaling')
	Min_Value = models.FloatField(null=True, blank=True, help_text='Minimum valid physical value')
	Max_Value = models.FloatField(null=True, blank=True, help_text='Maximum valid physical value')
	
	# Reference to the J1939 standard document
	Standard_Reference = models.ForeignKey(
		StandardFile, 
		on_delete=models.SET_NULL, 
		null=True, 
		blank=True, 
		related_name='parameter_definitions'
	)
	
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['PGN_DEC', 'SPN_Number']
		verbose_name = 'J1939 Parameter Definition'
		verbose_name_plural = 'J1939 Parameter Definitions'

	def __str__(self):
		return f"SPN {self.SPN_Number} - {self.SPN_Description}"

	def decode_value(self, raw_pgn_data):
		"""
		Decode the SPN value from raw CAN message data
		
		Args:
			raw_pgn_data: List/array of 8 bytes (the CAN message data)
		
		Returns:
			dict with 'physical_value', 'unit', 'status', and 'raw_value'
		
		Formula: Physical Value = (Raw Value × Resolution) + Offset
		"""
		try:
			if not raw_pgn_data or len(raw_pgn_data) < 8:
				return {
					'physical_value': None,
					'unit': self.Unit,
					'status': 'error',
					'message': 'Invalid data length'
				}
			
			# Extract raw value based on Start_Byte, Start_Bit, and Bit_Length
			raw_value = self._extract_raw_value(raw_pgn_data)
			
			# Check for special J1939 indicators
			# 0xFF (255) = Not Available, 0xFE (254) = Error/Parameter Specific
			if self.Bit_Length == 8:
				if raw_value == 0xFF:
					return {
						'physical_value': None,
						'unit': self.Unit,
						'status': 'not_available',
						'message': 'Parameter not available (0xFF)',
						'raw_value': raw_value
					}
				elif raw_value == 0xFE:
					return {
						'physical_value': None,
						'unit': self.Unit,
						'status': 'error_indicator',
						'message': 'Error indicator (0xFE)',
						'raw_value': raw_value
					}
			elif self.Bit_Length == 16:
				if raw_value == 0xFFFF:
					return {
						'physical_value': None,
						'unit': self.Unit,
						'status': 'not_available',
						'message': 'Parameter not available (0xFFFF)',
						'raw_value': raw_value
					}
				elif raw_value == 0xFFFE:
					return {
						'physical_value': None,
						'unit': self.Unit,
						'status': 'error_indicator',
						'message': 'Error indicator (0xFFFE)',
						'raw_value': raw_value
					}
			
			# Apply J1939 decoding formula: Physical Value = (Raw Value × Resolution) + Offset
			physical_value = (raw_value * self.Resolution) + self.Offset
			
			# Check if value is within valid range
			status = 'valid'
			if self.Min_Value is not None and physical_value < self.Min_Value:
				status = 'below_range'
			elif self.Max_Value is not None and physical_value > self.Max_Value:
				status = 'above_range'
			
			return {
				'physical_value': round(physical_value, 4),
				'unit': self.Unit,
				'status': status,
				'raw_value': raw_value,
				'spn': self.SPN_Number,
				'description': self.SPN_Description
			}
			
		except Exception as e:
			return {
				'physical_value': None,
				'unit': self.Unit,
				'status': 'decode_error',
				'message': str(e)
			}

	def _extract_raw_value(self, raw_pgn_data):
		"""
		Extract the raw SPN value from CAN message bytes
		
		Uses Start_Byte (1-indexed), Start_Bit, and Bit_Length
		to extract the correct bits from the message
		"""
		# Convert to 0-indexed byte position
		byte_index = self.Start_Byte - 1
		
		if self.Bit_Length <= 8 and self.Data_Length_Bytes == 1:
			# Single byte extraction with bit masking
			byte_val = raw_pgn_data[byte_index]
			# Create bit mask and shift
			mask = (1 << self.Bit_Length) - 1
			return (byte_val >> self.Start_Bit) & mask
		
		elif self.Bit_Length <= 16 and self.Data_Length_Bytes == 2:
			# Two byte extraction (little-endian as per J1939)
			low_byte = raw_pgn_data[byte_index]
			high_byte = raw_pgn_data[byte_index + 1]
			return low_byte + (high_byte << 8)
		
		elif self.Bit_Length <= 32 and self.Data_Length_Bytes == 4:
			# Four byte extraction (little-endian)
			value = 0
			for i in range(4):
				value += raw_pgn_data[byte_index + i] << (i * 8)
			return value
		
		else:
			# Generic multi-byte extraction
			value = 0
			for i in range(self.Data_Length_Bytes):
				if byte_index + i < len(raw_pgn_data):
					value += raw_pgn_data[byte_index + i] << (i * 8)
			return value

	@classmethod
	def get_definition_for_spn(cls, spn_number):
		"""Get the parameter definition for a specific SPN"""
		try:
			return cls.objects.get(SPN_Number=spn_number)
		except cls.DoesNotExist:
			return None

	@classmethod
	def get_definitions_for_pgn(cls, pgn_decimal):
		"""Get all SPN definitions for a specific PGN"""
		return cls.objects.filter(PGN_DEC=pgn_decimal)

	@classmethod
	def count_unique_spns(cls, pgn_data_stream):
		"""
		Analyze a stream of PGN messages and count unique SPNs
		
		Args:
			pgn_data_stream: List of dicts with 'pgn' and optional 'spns' keys
		
		Returns:
			dict with 'count', 'unique_spns', and 'spn_details'
		"""
		unique_spns = set()
		spn_occurrences = {}
		
		for message in pgn_data_stream:
			pgn = message.get('pgn')
			spns = message.get('spns', [])
			
			# If SPNs are provided directly
			if spns:
				for spn in spns:
					spn_num = spn if isinstance(spn, int) else spn.get('spn_number', spn.get('spn'))
					if spn_num:
						unique_spns.add(spn_num)
						spn_occurrences[spn_num] = spn_occurrences.get(spn_num, 0) + 1
			
			# Otherwise, look up SPNs by PGN from our definitions
			elif pgn:
				definitions = cls.get_definitions_for_pgn(pgn)
				for defn in definitions:
					unique_spns.add(defn.SPN_Number)
					spn_occurrences[defn.SPN_Number] = spn_occurrences.get(defn.SPN_Number, 0) + 1
		
		# Get SPN details
		spn_details = []
		for spn_num in sorted(unique_spns):
			defn = cls.get_definition_for_spn(spn_num)
			if defn:
				spn_details.append({
					'spn_number': spn_num,
					'description': defn.SPN_Description,
					'unit': defn.Unit,
					'pgn': defn.PGN_DEC,
					'occurrences': spn_occurrences.get(spn_num, 0)
				})
			else:
				spn_details.append({
					'spn_number': spn_num,
					'description': 'Unknown SPN',
					'unit': 'N/A',
					'pgn': None,
					'occurrences': spn_occurrences.get(spn_num, 0)
				})
		
		return {
			'count': len(unique_spns),
			'unique_spns': sorted(list(unique_spns)),
			'spn_details': spn_details,
			'spn_occurrences': spn_occurrences
		}

