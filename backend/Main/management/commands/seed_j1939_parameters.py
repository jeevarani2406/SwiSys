"""
Management command to seed J1939 Parameter Definitions
Based on SAE J1939-71 standard for the following PGNs and SPNs:

PGNs: 0, 65254 (FEE6), 65257 (FEE9), 65265 (FEF1)
SPNs: 4191, 84, 959, 960, 961, 962, 963, 964, 182
"""

from django.core.management.base import BaseCommand
from Main.models import J1939ParameterDefinition


class Command(BaseCommand):
    help = 'Seed the J1939 Parameter Definitions table with standard SAE J1939-71 data'

    def handle(self, *args, **options):
        # J1939 Parameter Definitions based on SAE J1939-71 standard
        # For PGNs: 0, 65254, 65257, 65265
        # For SPNs: 4191, 84, 959, 960, 961, 962, 963, 964, 182
        
        j1939_parameters = [
            {
                'SPN_Number': 4191,
                'PGN_DEC': 0,
                'PGN_HEX': '0x0000',
                'SPN_Description': 'Engine Requested Torque - High Resolution',
                'Unit': '%',
                'Data_Length_Bytes': 1,
                'Start_Byte': 6,
                'Start_Bit': 4,
                'Bit_Length': 4,
                'Resolution': 0.125,
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 125.0,
            },
            {
                'SPN_Number': 84,
                'PGN_DEC': 65265,
                'PGN_HEX': '0xFEF1',
                'SPN_Description': 'Wheel-Based Vehicle Speed',
                'Unit': 'km/h',
                'Data_Length_Bytes': 2,
                'Start_Byte': 2,
                'Start_Bit': 0,
                'Bit_Length': 16,
                'Resolution': 0.00390625,  # 1/256 km/h per bit
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 250.996,
            },
            {
                'SPN_Number': 182,
                'PGN_DEC': 65257,
                'PGN_HEX': '0xFEE9',
                'SPN_Description': 'Engine Trip Fuel',
                'Unit': 'L',
                'Data_Length_Bytes': 4,
                'Start_Byte': 1,
                'Start_Bit': 0,
                'Bit_Length': 32,
                'Resolution': 0.5,
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 2147483647.5,
            },
            {
                'SPN_Number': 959,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Seconds',
                'Unit': 's',
                'Data_Length_Bytes': 1,
                'Start_Byte': 1,
                'Start_Bit': 0,
                'Bit_Length': 8,
                'Resolution': 0.25,
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 59.75,
            },
            {
                'SPN_Number': 960,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Minutes',
                'Unit': 'min',
                'Data_Length_Bytes': 1,
                'Start_Byte': 2,
                'Start_Bit': 0,
                'Bit_Length': 8,
                'Resolution': 1.0,
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 59.0,
            },
            {
                'SPN_Number': 961,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Hours',
                'Unit': 'hr',
                'Data_Length_Bytes': 1,
                'Start_Byte': 3,
                'Start_Bit': 0,
                'Bit_Length': 8,
                'Resolution': 1.0,
                'Offset': 0.0,
                'Min_Value': 0.0,
                'Max_Value': 23.0,
            },
            {
                'SPN_Number': 962,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Day',
                'Unit': 'day',
                'Data_Length_Bytes': 1,
                'Start_Byte': 4,
                'Start_Bit': 0,
                'Bit_Length': 8,
                'Resolution': 0.25,
                'Offset': 0.0,
                'Min_Value': 0.25,
                'Max_Value': 31.0,
            },
            {
                'SPN_Number': 963,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Month',
                'Unit': 'month',
                'Data_Length_Bytes': 1,
                'Start_Byte': 5,
                'Start_Bit': 0,
                'Bit_Length': 8,
                'Resolution': 1.0,
                'Offset': 0.0,
                'Min_Value': 1.0,
                'Max_Value': 12.0,
            },
            {
                'SPN_Number': 964,
                'PGN_DEC': 65254,
                'PGN_HEX': '0xFEE6',
                'SPN_Description': 'Year',
                'Unit': 'year',
                'Data_Length_Bytes': 2,
                'Start_Byte': 6,
                'Start_Bit': 0,
                'Bit_Length': 16,
                'Resolution': 1.0,
                'Offset': 1985.0,  # Year offset as per J1939 standard
                'Min_Value': 1985.0,
                'Max_Value': 2235.0,
            },
        ]

        created_count = 0
        updated_count = 0

        for param in j1939_parameters:
            obj, created = J1939ParameterDefinition.objects.update_or_create(
                SPN_Number=param['SPN_Number'],
                defaults=param
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created: SPN {param['SPN_Number']} - {param['SPN_Description']}")
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f"Updated: SPN {param['SPN_Number']} - {param['SPN_Description']}")
                )

        self.stdout.write(self.style.SUCCESS(
            f"\n✅ J1939 Parameter Definitions seeded successfully!"
            f"\n   Created: {created_count}"
            f"\n   Updated: {updated_count}"
            f"\n   Total: {created_count + updated_count}"
        ))
        
        # Display summary table
        self.stdout.write("\n📊 Parameter Summary:")
        self.stdout.write("-" * 100)
        self.stdout.write(f"{'SPN':<8} {'PGN (Hex)':<12} {'Description':<40} {'Unit':<10} {'Resolution':<12} {'Offset':<10}")
        self.stdout.write("-" * 100)
        
        for param in J1939ParameterDefinition.objects.all().order_by('PGN_DEC', 'SPN_Number'):
            self.stdout.write(
                f"{param.SPN_Number:<8} {param.PGN_HEX:<12} {param.SPN_Description[:38]:<40} "
                f"{param.Unit:<10} {param.Resolution:<12} {param.Offset:<10}"
            )
