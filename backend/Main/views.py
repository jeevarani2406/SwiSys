import io
import logging
import traceback
import os
import re
import json
from collections import defaultdict
from datetime import datetime, date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.core.files.storage import default_storage
from django.http import JsonResponse

from openpyxl import load_workbook

from .models import Vehicle, SPN, PGN, VehicleSPN, VehiclePGN, StandardFile, AuxiliaryFile, Category
from rest_framework import generics
from .serializers import VehicleSerializer, VehicleSPNSerializer, StandardFileSerializer, AuxiliaryFileSerializer, CategorySerializer, PGNSerializer, SPNSerializer
from django.db.models import Count
from rest_framework.parsers import MultiPartParser, FormParser

# Import pandas lazily inside methods to avoid import-time failures during
# Django management commands (makemigrations/migrate) when pandas may not be
# available in the environment. When available we will use it for Excel
# parsing; otherwise we fallback to openpyxl-only parsing.
pd = None
try:
    import pandas as pd  # type: ignore
except Exception:
    pd = None

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class J1939UploadView(APIView):
    """
    POST /api/j1939/upload
    
    Accepts multiple Excel files from the frontend, parses their content, and extracts
    structured vehicle, PGN, and SPN information.
    
    Returns:
    {
        "status": "success",
        "vehicles": [
            {
                "name": "Truck A",
                "brand": "Volvo",
                "pgns": [601, 602],
                "spns": [
                    { "pgn": 601, "spn": 190, "description": "Engine Speed" },
                    { "pgn": 602, "spn": 247, "description": "Oil Temp" }
                ]
            }
        ],
        "errors": []
    }
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        """
        Process multiple Excel file uploads.
        """
        # Gather files from common field names
        files = []
        if request.FILES.getlist('file'):
            files = request.FILES.getlist('file')
        elif request.FILES.getlist('files[]'):
            files = request.FILES.getlist('files[]')
        elif request.FILES.getlist('files'):
            files = request.FILES.getlist('files')
        else:
            try:
                files = list(request.FILES.values())
            except Exception:
                files = []

        if not files:
            return Response({
                'status': 'error',
                'vehicles': [],
                'errors': ['No files uploaded']
            }, status=status.HTTP_400_BAD_REQUEST)

        vehicles = []
        errors = []
        today = timezone.now().date()

        for f in files:
            fname = getattr(f, 'name', '<unknown>')
            logger.info('Processing file: %s', fname)

            # Validate file type (allow .xlsx, .xls, .csv)
            if not (isinstance(fname, str) and (fname.lower().endswith('.xlsx') or fname.lower().endswith('.xls') or fname.lower().endswith('.csv'))):
                errors.append({
                    'filename': fname,
                    'error': 'Invalid file type. Only .xlsx, .xls and .csv files are allowed.'
                })
                logger.warning('Invalid file type: %s', fname)
                continue

            try:
                # Read file content
                f.seek(0)
                file_content = f.read()
                f.seek(0)

                # Parse file (Excel or CSV)
                try:
                    if fname.lower().endswith('.csv'):
                        # CSV: read as single-sheet structure
                        f.seek(0)
                        if pd is not None:
                            df = pd.read_csv(io.BytesIO(file_content) if isinstance(file_content, (bytes, bytearray)) else io.StringIO(file_content))
                            df_dict = {os.path.splitext(fname)[0]: df}
                        else:
                            # Fallback CSV parser -> produce dict-like structure compatible with downstream code
                            text = file_content.decode('utf-8', errors='ignore') if isinstance(file_content, (bytes, bytearray)) else str(file_content)
                            import csv as _csv
                            rows = list(_csv.reader(text.splitlines()))
                            if not rows:
                                df_dict = {os.path.splitext(fname)[0]: {}}
                            else:
                                headers = rows[0]
                                data_rows = rows[1:]
                                sheet_data = {}
                                for col_idx, header in enumerate(headers):
                                    sheet_data[header] = [r[col_idx] if col_idx < len(r) else None for r in data_rows]
                                df_dict = {os.path.splitext(fname)[0]: sheet_data}
                    else:
                        # Excel file
                        if pd is not None:
                            # Use pandas for better Excel parsing
                            df_dict = pd.read_excel(io.BytesIO(file_content), sheet_name=None, engine='openpyxl')
                        else:
                            # Fallback to openpyxl - convert to simple data structure
                            wb = load_workbook(filename=io.BytesIO(file_content), data_only=True)
                            df_dict = {}
                            for sheet_name in wb.sheetnames:
                                sheet = wb[sheet_name]
                                # Convert sheet to list of lists for processing
                                data = []
                                headers = None
                                for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
                                    if row_idx == 0:
                                        headers = [str(cell) if cell is not None else f'Col{i}' for i, cell in enumerate(row)]
                                    else:
                                        data.append(list(row))
                                # Create a simple dict-like structure for compatibility
                                if headers and data:
                                    # Store as dict with column names as keys
                                    sheet_data = {}
                                    for col_idx, header in enumerate(headers):
                                        sheet_data[header] = [row[col_idx] if col_idx < len(row) else None for row in data]
                                    df_dict[sheet_name] = sheet_data
                                else:
                                    df_dict[sheet_name] = {}
                except Exception as parse_exc:
                    error_msg = f'Failed to parse file: {str(parse_exc)}'
                    errors.append({
                        'filename': fname,
                        'error': error_msg
                    })
                    logger.error('File parsing error for %s: %s', fname, str(parse_exc), exc_info=True)
                    continue

                # Extract vehicle information
                vehicle_name = None
                brand = None
                pgns = set()
                spns_data = {}  # {(pgn, spn): description}

                # Try to extract from all sheets
                for sheet_name, df in df_dict.items():
                    # Handle both pandas DataFrame and dict structure
                    if df is None:
                        continue
                    
                    # Check if it's a pandas DataFrame
                    is_dataframe = pd is not None and isinstance(df, pd.DataFrame)
                    if is_dataframe and df.empty:
                        continue
                    
                    # For dict structure, check if it's empty
                    if not is_dataframe and (not df or len(df) == 0):
                        continue

                    # Extract vehicle name and brand
                    vehicle_name_aliases = ['vehicle name', 'veh name', 'vehicle', 'veh', 'unit name', 'name']
                    brand_aliases = ['brand', 'make', 'manufacturer', 'manufacturer name']

                    # Search in first few rows and columns
                    max_rows = len(df) if is_dataframe else max([len(v) for v in df.values()] if isinstance(df, dict) else [0])
                    max_cols = len(df.columns) if is_dataframe else len(df) if isinstance(df, dict) else 0
                    
                    for row_idx in range(min(10, max_rows)):
                        for col_idx in range(min(10, max_cols)):
                            try:
                                if is_dataframe:
                                    cell_value = str(df.iloc[row_idx, col_idx]).strip().lower()
                                else:
                                    # For dict structure, access by column name
                                    col_names = list(df.keys()) if isinstance(df, dict) else []
                                    if col_idx < len(col_names):
                                        col_name = col_names[col_idx]
                                        cell_value = str(df[col_name][row_idx] if row_idx < len(df[col_name]) else '').strip().lower()
                                    else:
                                        continue
                                
                                # Check for vehicle name
                                if not vehicle_name:
                                    for alias in vehicle_name_aliases:
                                        if alias in cell_value:
                                            # Try to get value from adjacent cell or next row
                                            try:
                                                if col_idx + 1 < max_cols:
                                                    if is_dataframe:
                                                        candidate = str(df.iloc[row_idx, col_idx + 1]).strip()
                                                    else:
                                                        next_col = col_names[col_idx + 1] if col_idx + 1 < len(col_names) else None
                                                        candidate = str(df[next_col][row_idx] if next_col and row_idx < len(df[next_col]) else '').strip()
                                                    if candidate and candidate.lower() not in ['nan', 'none', '']:
                                                        vehicle_name = candidate
                                                        break
                                            except:
                                                pass
                                
                                # Check for brand
                                if not brand:
                                    for alias in brand_aliases:
                                        if alias in cell_value:
                                            try:
                                                if col_idx + 1 < max_cols:
                                                    if is_dataframe:
                                                        candidate = str(df.iloc[row_idx, col_idx + 1]).strip()
                                                    else:
                                                        next_col = col_names[col_idx + 1] if col_idx + 1 < len(col_names) else None
                                                        candidate = str(df[next_col][row_idx] if next_col and row_idx < len(df[next_col]) else '').strip()
                                                    if candidate and candidate.lower() not in ['nan', 'none', '']:
                                                        brand = candidate
                                                        break
                                            except:
                                                pass
                            except:
                                continue

                    # Extract PGNs and SPNs
                    pgn_aliases = ['pgn', 'pgn number', 'pgn_no', 'pgn_number', 'parameter group number']
                    spn_aliases = ['spn', 'spn number', 'spn_no', 'spn_number', 'suspect parameter number']

                    # Find column indices/names
                    pgn_col_idx = None
                    pgn_col_name = None
                    spn_col_idx = None
                    spn_col_name = None
                    desc_col_idx = None
                    desc_col_name = None

                    # Check header row
                    if is_dataframe:
                        columns = df.columns
                        for col_idx, col_name in enumerate(columns):
                            col_str = str(col_name).strip().lower()
                            if any(alias in col_str for alias in pgn_aliases):
                                pgn_col_idx = col_idx
                            if any(alias in col_str for alias in spn_aliases):
                                spn_col_idx = col_idx
                            if 'description' in col_str or 'desc' in col_str:
                                desc_col_idx = col_idx
                    else:
                        # For dict structure
                        for col_name in df.keys():
                            col_str = str(col_name).strip().lower()
                            if any(alias in col_str for alias in pgn_aliases):
                                pgn_col_name = col_name
                            if any(alias in col_str for alias in spn_aliases):
                                spn_col_name = col_name
                            if 'description' in col_str or 'desc' in col_str:
                                desc_col_name = col_name

                    # Extract data from rows
                    num_rows = len(df) if is_dataframe else max([len(v) for v in df.values()] if isinstance(df, dict) else [0])
                    current_pgn = None  # Track current PGN for rows without explicit PGN
                    
                    for row_idx in range(num_rows):
                        try:
                            pgn_value = None
                            spn_value = None
                            desc_value = ''

                            # Get PGN
                            if is_dataframe:
                                if pgn_col_idx is not None:
                                    try:
                                        pgn_val = df.iloc[row_idx, pgn_col_idx]
                                        if pd is not None and pd.notna(pgn_val):
                                            pgn_value = int(float(str(pgn_val)))
                                            if 100 <= pgn_value <= 999999:
                                                pgns.add(pgn_value)
                                                current_pgn = pgn_value
                                        elif pgn_val is not None:
                                            pgn_value = int(float(str(pgn_val)))
                                            if 100 <= pgn_value <= 999999:
                                                pgns.add(pgn_value)
                                                current_pgn = pgn_value
                                    except:
                                        pass
                            else:
                                if pgn_col_name and pgn_col_name in df:
                                    try:
                                        pgn_val = df[pgn_col_name][row_idx] if row_idx < len(df[pgn_col_name]) else None
                                        if pgn_val is not None:
                                            pgn_value = int(float(str(pgn_val)))
                                            if 100 <= pgn_value <= 999999:
                                                pgns.add(pgn_value)
                                                current_pgn = pgn_value
                                    except:
                                        pass

                            # Get SPN
                            if is_dataframe:
                                if spn_col_idx is not None:
                                    try:
                                        spn_val = df.iloc[row_idx, spn_col_idx]
                                        if pd is not None and pd.notna(spn_val):
                                            spn_value = int(float(str(spn_val)))
                                        elif spn_val is not None:
                                            spn_value = int(float(str(spn_val)))
                                    except:
                                        pass
                            else:
                                if spn_col_name and spn_col_name in df:
                                    try:
                                        spn_val = df[spn_col_name][row_idx] if row_idx < len(df[spn_col_name]) else None
                                        if spn_val is not None:
                                            spn_value = int(float(str(spn_val)))
                                    except:
                                        pass

                            # Get description
                            if is_dataframe:
                                if desc_col_idx is not None:
                                    try:
                                        desc_val = df.iloc[row_idx, desc_col_idx]
                                        if pd is not None and pd.notna(desc_val):
                                            desc_value = str(desc_val).strip()
                                        elif desc_val is not None:
                                            desc_value = str(desc_val).strip()
                                    except:
                                        pass
                            else:
                                if desc_col_name and desc_col_name in df:
                                    try:
                                        desc_val = df[desc_col_name][row_idx] if row_idx < len(df[desc_col_name]) else None
                                        if desc_val is not None:
                                            desc_value = str(desc_val).strip()
                                    except:
                                        pass

                            # Store SPN with PGN relationship
                            if spn_value is not None:
                                # Use PGN from current row, or fallback to last seen PGN
                                final_pgn = pgn_value if pgn_value else current_pgn
                                
                                if final_pgn:
                                    spns_data[(final_pgn, spn_value)] = desc_value
                                else:
                                    # Store without PGN if not found
                                    spns_data[(None, spn_value)] = desc_value

                        except Exception as row_exc:
                            logger.debug('Error processing row %d: %s', row_idx, str(row_exc))
                            continue

                # Fallback: extract from filename if vehicle name not found
                if not vehicle_name:
                    # Try to extract from filename (remove extension)
                    vehicle_name = os.path.splitext(fname)[0].strip()
                    if not vehicle_name or vehicle_name == '<unknown>':
                        vehicle_name = 'Unknown'

                # Default brand if not found
                if not brand:
                    brand = ''

                # Allow repeated uploads of the same vehicle on the same day (no duplicate blocking)

                # Get or create user
                try:
                    uploaded_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
                except Exception:
                    uploaded_by = None

                # Save Excel file for auditing (optional)
                excel_file_path = None
                try:
                    # Save file to media storage
                    file_path = f'j1939_uploads/{today.year}/{today.month:02d}/{today.day:02d}/{fname}'
                    saved_path = default_storage.save(file_path, f)
                    excel_file_path = saved_path
                    logger.info('Saved Excel file for auditing: %s', saved_path)
                except Exception as save_exc:
                    logger.warning('Failed to save Excel file for auditing: %s', str(save_exc))
                    # Continue processing even if file save fails

                # Create vehicle record
                vehicle = Vehicle.objects.create(
                    name=str(vehicle_name),
                    brand=str(brand),
                    uploaded_by=uploaded_by,
                    source_file=fname,
                    excel_file=excel_file_path if excel_file_path else None
                )

                # Create PGN records and associations
                vehicle_pgns = []
                for pgn_num in sorted(pgns):
                    pgn_obj, _ = PGN.objects.get_or_create(pgn_number=int(pgn_num))
                    VehiclePGN.objects.get_or_create(vehicle=vehicle, pgn=pgn_obj)
                    vehicle_pgns.append(pgn_num)

                # Create SPN records and associations with PGN relationships
                vehicle_spns = []
                for (pgn_num, spn_num), description in spns_data.items():
                    try:
                        pgn_obj = None
                        if pgn_num:
                            pgn_obj, _ = PGN.objects.get_or_create(pgn_number=int(pgn_num))

                        spn_obj, _ = SPN.objects.get_or_create(
                            spn_number=int(spn_num),
                            defaults={'description': description or ''}
                        )
                        # Update description if it was empty
                        if description and not spn_obj.description:
                            spn_obj.description = description
                            spn_obj.save()

                        vspn, created = VehicleSPN.objects.get_or_create(
                            vehicle=vehicle,
                            spn=spn_obj,
                            defaults={'pgn': pgn_obj}
                        )
                        if not created and pgn_obj and vspn.pgn != pgn_obj:
                            vspn.pgn = pgn_obj
                        if description:
                            vspn.value = description
                            vspn.supported = True
                        if pgn_obj and not vspn.pgn:
                            vspn.pgn = pgn_obj
                        vspn.save()

                        # Store for response (use PGN if available, otherwise None)
                        vehicle_spns.append({
                            'pgn': pgn_num if pgn_num else None,
                            'spn': spn_num,
                            'description': description or spn_obj.description or ''
                        })
                    except Exception as spn_exc:
                        logger.error('Error creating SPN %d: %s', spn_num, str(spn_exc))
                        continue

                # Build response data
                vehicles.append({
                    'id': vehicle.id,
                    'name': vehicle.name,
                    'brand': vehicle.brand,
                    'source_file': vehicle.source_file,
                    'pgns': vehicle_pgns,
                    'spns': vehicle_spns
                })

                logger.info('Successfully processed file %s: Vehicle=%s, PGNs=%d, SPNs=%d',
                           fname, vehicle.name, len(vehicle_pgns), len(vehicle_spns))

            except Exception as exc:
                error_msg = f'Error processing file: {str(exc)}'
                errors.append({
                    'filename': fname,
                    'error': error_msg
                })
                logger.error('Exception processing %s: %s', fname, str(exc), exc_info=True)

        # Build response - always return "success" status if request was processed
        # Errors are reported in the errors array
        response_data = {
            'status': 'success',
            'vehicles': vehicles,
            'errors': errors
        }

        # Return 200 OK even if there are errors, as long as the request was processed
        # Individual file errors are reported in the errors array
        status_code = status.HTTP_200_OK
        if not vehicles and errors:
            # If no vehicles were processed and there are errors, still return 200
            # but the errors array will contain the issues
            status_code = status.HTTP_200_OK

        return Response(response_data, status=status_code)


@method_decorator(csrf_exempt, name='dispatch')
class UploadAPIView(APIView):
    """
    New /api/upload/ endpoint per spec. Accepts a single file (or multiple) under 'file'.
    Parses Excel sheets, extracts vehicle name, brand, SPNs and PGNs and values, stores them, and
    returns a structured JSON summary per uploaded file.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        files = request.FILES.getlist('file') or request.FILES.getlist('files[]') or list(request.FILES.values())
        if not files:
            return Response({'detail': 'No files uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        responses = []
        # header alias lists to support varied spreadsheets
        vehicle_name_aliases = ['vehicle name', 'veh name', 'vehicle', 'veh', 'unit name']
        brand_aliases = ['brand', 'make', 'manufacturer']
        spn_aliases = ['spn', 'spn number', 'spn_no', 'spn_number']
        pgn_aliases = ['pgn', 'pgn number', 'pgn_no', 'pgn_number']

        for f in files:
            fname = getattr(f, 'name', 'unknown')
            # validate extension
            if not (isinstance(fname, str) and (fname.lower().endswith('.xlsx') or fname.lower().endswith('.xls'))):
                responses.append({'filename': fname, 'error': 'Invalid file extension'})
                continue
            try:
                # Try openpyxl via pandas for robust sheet reading
                try:
                    xl = pd.read_excel(f, sheet_name=None, engine='openpyxl')
                except Exception:
                    # fallback: read via openpyxl directly
                    f.seek(0)
                    wb = load_workbook(filename=io.BytesIO(f.read()), data_only=True)
                    xl = {s.title: pd.DataFrame(wb[s].values) for s in wb.sheetnames}

                # Heuristic across sheets to find vehicle name/brand and SPNs/PGNs
                vehicle_name = None
                brand = None
                pgns = set()
                spns = {}  # spn_number -> value (string)

                for sheet_name, df in xl.items():
                    # Normalize DataFrame: if header row missing, create numeric columns
                    if isinstance(df.columns, pd.RangeIndex) and df.shape[0] > 0:
                        # attempt to check header-like first row
                        first_row = df.iloc[0].astype(str).fillna('').tolist()
                    else:
                        first_row = [str(x).strip().lower() for x in df.columns]

                    # Try to identify vehicle name / brand from header rows or first rows
                    joined_head = ' '.join([str(x) for x in first_row]).lower()
                    for alias in vehicle_name_aliases:
                        if alias in joined_head and not vehicle_name:
                            # attempt to locate column index
                            for i, val in enumerate(first_row):
                                if alias in str(val).lower():
                                    # look for non-empty cell in next rows
                                    for r in range(1, min(6, df.shape[0])):
                                        try:
                                            candidate = str(df.iloc[r, i])
                                        except Exception:
                                            candidate = ''
                                        if candidate and candidate.lower() not in ['nan', 'none', '']:
                                            vehicle_name = candidate.strip()
                                            break
                                    break
                    for alias in brand_aliases:
                        if alias in joined_head and not brand:
                            for i, val in enumerate(first_row):
                                if alias in str(val).lower():
                                    for r in range(1, min(6, df.shape[0])):
                                        try:
                                            candidate = str(df.iloc[r, i])
                                        except Exception:
                                            candidate = ''
                                        if candidate and candidate.lower() not in ['nan', 'none', '']:
                                            brand = candidate.strip()
                                            break
                                    break

                    # Detect SPN/PGN columns by header names
                    col_map = {i: str(c).strip().lower() for i, c in enumerate(df.columns)}
                    spn_cols = [i for i, h in col_map.items() if any(a in h for a in spn_aliases)]
                    pgn_cols = [i for i, h in col_map.items() if any(a in h for a in pgn_aliases)]

                    # If SPN/PGN columns found, use them
                    if spn_cols:
                        for i in spn_cols:
                            for r in range(1, df.shape[0]):
                                try:
                                    spn_val = df.iat[r, i]
                                except Exception:
                                    continue
                                if pd.isna(spn_val):
                                    continue
                                s = str(spn_val).strip()
                                # if like '190: 2200 RPM' parse
                                if ':' in s or '=' in s:
                                    parts = s.replace('=', ':').split(':')
                                    try:
                                        spnnum = int(parts[0])
                                        spns[spnnum] = parts[1].strip() if len(parts) > 1 else ''
                                    except Exception:
                                        # try to extract digits
                                        import re
                                        m = re.search(r"(\d{1,6})", s)
                                        if m:
                                            spnnum = int(m.group(1))
                                            remainder = s.replace(m.group(0), '').strip(' :\t')
                                            spns[spnnum] = remainder
                                else:
                                    try:
                                        num = int(s)
                                        spns[num] = ''
                                    except Exception:
                                        pass

                    if pgn_cols:
                        for i in pgn_cols:
                            for r in range(1, df.shape[0]):
                                try:
                                    pval = df.iat[r, i]
                                except Exception:
                                    continue
                                if pd.isna(pval):
                                    continue
                                try:
                                    valnum = int(str(pval).strip())
                                    if 100 <= valnum <= 999999:
                                        pgns.add(valnum)
                                except Exception:
                                    pass

                    # fallback scan: scan all cells for explicit SPN/PGN patterns
                    for col in df.columns:
                        try:
                            series = df[col].dropna().astype(str)
                        except Exception:
                            continue
                        for v in series:
                            vs = str(v)
                            low = vs.lower()
                            if 'spn' in low:
                                parts = vs.replace(':', ' ').replace('=', ' ').split()
                                for i_p, p in enumerate(parts):
                                    if p.lower().startswith('spn') and i_p + 1 < len(parts):
                                        try:
                                            spn_num = int(parts[i_p+1])
                                            val = None
                                            if i_p + 2 < len(parts):
                                                val = parts[i_p+2]
                                            spns[spn_num] = val or ''
                                        except Exception:
                                            pass
                            try:
                                num = int(vs)
                                if 100 <= num <= 999999:
                                    pgns.add(num)
                            except Exception:
                                pass

                # Ensure some defaults
                vehicle_name = vehicle_name or getattr(f, 'name', 'Unknown')
                brand = brand or ''

                uploaded_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None

                vehicle = Vehicle.objects.create(name=str(vehicle_name), brand=str(brand), uploaded_by=uploaded_by, source_file=str(fname))

                # Persist PGNs
                for p in sorted(pgns):
                    pgn_obj, _ = PGN.objects.get_or_create(pgn_number=int(p))
                    VehiclePGN.objects.get_or_create(vehicle=vehicle, pgn=pgn_obj)

                # Persist SPNs
                for spn_num, val in spns.items():
                    spn_obj, _ = SPN.objects.get_or_create(spn_number=int(spn_num))
                    vspn, created = VehicleSPN.objects.get_or_create(vehicle=vehicle, spn=spn_obj)
                    # store value and mark supported if non-empty
                    if val is not None and str(val).strip() != '':
                        vspn.value = str(val)
                        vspn.supported = True
                        vspn.save()

                # compute summary
                total_pgns = VehiclePGN.objects.filter(vehicle=vehicle).count()
                total_spns = VehicleSPN.objects.filter(vehicle=vehicle).count()

                supported_spns_qs = VehicleSPN.objects.filter(vehicle=vehicle).select_related('spn')
                supported_spns = []
                for vs in supported_spns_qs:
                    supported_spns.append({'spn': vs.spn.spn_number, 'desc': vs.spn.description, 'value': vs.value if vs.supported else None, 'supported': bool(vs.supported)})

                responses.append({
                    'vehicle': vehicle.name,
                    'brand': vehicle.brand,
                    'spn_count': total_spns,
                    'pgn_count': total_pgns,
                    'source_file': vehicle.source_file,
                    'supported_spns': supported_spns,
                })

            except Exception as exc:
                tb = traceback.format_exc()
                logger.exception('Error processing uploaded file %s', fname)
                responses.append({'filename': fname, 'error': str(exc), 'traceback': tb})

        return Response({'results': responses}, status=status.HTTP_200_OK)


class VehicleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = Vehicle.objects.all()
        out = []
        for v in vehicles:
            pgn_count = VehiclePGN.objects.filter(vehicle=v).count()
            spn_count = VehicleSPN.objects.filter(vehicle=v).count()
            out.append({'id': v.id, 'name': v.name, 'brand': v.brand, 'pgns': pgn_count, 'spns': spn_count})
        return Response(out)


class VehicleSpnsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, vehicle_id):
        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)

        spns = VehicleSPN.objects.filter(vehicle=vehicle).select_related('spn', 'pgn')
        spn_payload = [
            {
                'pgn': s.pgn.pgn_number if s.pgn else None,
                'spn': s.spn.spn_number,
                'description': s.spn.description,
                'supported': s.supported,
                'value': s.value if s.supported else None
            }
            for s in spns
        ]
        return Response({
            'vehicle_id': vehicle.id,
            'vehicle': vehicle.name,
            'brand': vehicle.brand,
            'spns': spn_payload
        })


class SpnVehiclesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, spn_number):
        try:
            spn_number = int(spn_number)
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid SPN number'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            spn = SPN.objects.get(spn_number=spn_number)
            description = spn.description
        except SPN.DoesNotExist:
            description = ''
            spn = None

        vehicles = []
        if spn:
            vspns = VehicleSPN.objects.filter(spn=spn, supported=True).select_related('vehicle')
            vehicles = [
                {
                    'name': v.vehicle.name,
                    'brand': v.vehicle.brand
                }
                for v in vspns
            ]

        return Response({
            'spn': spn_number,
            'description': description,
            'vehicles': vehicles
        })


# Standard Files and Auxiliary Files Views
class StandardFileListView(generics.ListCreateAPIView):
    """List and create standard files"""
    queryset = StandardFile.objects.all()
    serializer_class = StandardFileSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user if self.request.user.is_authenticated else None)


class StandardFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete standard files"""
    queryset = StandardFile.objects.all()
    serializer_class = StandardFileSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    parser_classes = [MultiPartParser, FormParser]


class AuxiliaryFileListView(generics.ListCreateAPIView):
    """List and create auxiliary files"""
    queryset = AuxiliaryFile.objects.all()
    serializer_class = AuxiliaryFileSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user if self.request.user.is_authenticated else None)


class AuxiliaryFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete auxiliary files"""
    queryset = AuxiliaryFile.objects.all()
    serializer_class = AuxiliaryFileSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    parser_classes = [MultiPartParser, FormParser]


class CategoryListView(generics.ListCreateAPIView):
    """List and create categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now

    def perform_create(self, serializer):
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now


class PGNListView(generics.ListAPIView):
    """List all PGNs"""
    queryset = PGN.objects.all()
    serializer_class = PGNSerializer
    permission_classes = [permissions.AllowAny]


class SPNListView(generics.ListAPIView):
    """List all SPNs"""
    queryset = SPN.objects.all()
    serializer_class = SPNSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------------------------------------------------------------
# Helpers: J1939 PGN→SPN map loading and summarization
# ---------------------------------------------------------------------------
_J1939_MAP_CACHE = None


def load_j1939_map():
    """
    Load J1939 PGN→SPN map from Main/j1939_map.json if available.
    Expected shape:
    {
      "61444": {
        "pgn_name": "...",
        "spns": [ {"spn": 190, "name": "Engine Speed"}, ... ]
      },
      "F004": { ... }  # hex keys also allowed
    }
    """
    global _J1939_MAP_CACHE
    if _J1939_MAP_CACHE is not None:
        return _J1939_MAP_CACHE
    try:
        map_path = os.path.join(os.path.dirname(__file__), "j1939_map.json")
        with open(map_path, "r", encoding="utf-8") as fh:
            _J1939_MAP_CACHE = json.load(fh)
    except Exception:
        _J1939_MAP_CACHE = {}
    return _J1939_MAP_CACHE


def summarize_pgns_with_map(pgn_list, j1939_map):
    """
    Given a list of PGN dicts (with pgn_hex/pgn_dec) and a J1939 map,
    return per-PGN SPN mapping and counts.
    """
    if not j1939_map:
        return {
            "pgn_count": 0,
            "spn_occurrences": 0,
            "unique_spn_count": 0,
            "pgn_spn_mapping": {}
        }

    pgn_spn_mapping = {}
    unique_spns = set()
    total_spn_occurrences = 0

    for p in pgn_list:
        pgn_hex = str(p.get('pgn_hex') or '').upper()
        pgn_dec = p.get('pgn_dec')

        # Try matching by hex then dec string
        entry = None
        if pgn_hex and pgn_hex in j1939_map:
            entry = j1939_map[pgn_hex]
        elif pgn_dec is not None and str(pgn_dec) in j1939_map:
            entry = j1939_map[str(pgn_dec)]

        if not entry:
            continue

        spns = entry.get("spns", [])
        spn_items = []
        for s in spns:
            spn_num = s.get("spn")
            if spn_num in (None, 0):
                continue
            unique_spns.add(spn_num)
            total_spn_occurrences += 1
            spn_items.append({
                "spn": spn_num,
                "name": s.get("name", f"SPN_{spn_num}")
            })

        pgn_spn_mapping[str(p.get('pgn_dec') or pgn_hex)] = {
            "pgn": p.get('pgn_dec') if p.get('pgn_dec') else pgn_hex,
            "name": entry.get("pgn_name", p.get("name", "")),
            "spns": spn_items,
            "spn_count": len(spn_items)
        }

    return {
        "pgn_count": len(pgn_spn_mapping),
        "spn_occurrences": total_spn_occurrences,
        "unique_spn_count": len(unique_spns),
        "pgn_spn_mapping": pgn_spn_mapping
    }


# ---------------------------------------------------------------------------
# CSV-based J1939 analysis (optional endpoint)
# Parses uploaded CSVs, maps PGNs/SPNs, and returns aggregates.
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def analyze_j1939_files(request):
    """
    Analyze J1939 files and extract PGNs, SPNs with mapping according to J1939 standard.
    Expects multipart/form-data with key 'files'.
    """
    files = request.FILES.getlist('files')
    vehicles = []
    errors = []
    total_spn_count = 0
    total_pgn_count = 0

    # Minimal J1939 Standard PGN-SPN mapping (extend with official data as needed)
    J1939_STANDARD_MAPPING = {
        '00F002': [
            'TransDrivelineEngaged', 'TrnsTorqueConverterLockupEngaged', 'TransShiftInProcess',
            'TrnsTrqCnvrtrLckpTrnstnInProcess', 'TransOutputShaftSpeed', 'PercentClutchSlip',
            'EngMomentaryOverspeedEnable', 'ProgressiveShiftDisable', 'MomentaryEngMaxPowerEnable',
            'TransInputShaftSpeed', 'SrcAddrssOfCntrllngDvcFrTrnsCtrl'
        ],
        '00F004': [
            'EngTorqueMode', 'ActlEngPrcntTorqueHighResolution', 'DriversDemandEngPercentTorque',
            'ActualEngPercentTorque', 'EngSpeed', 'SrcAddrssOfCntrllngDvcForEngCtrl',
            'EngStarterMode', 'EngDemandPercentTorque'
        ],
        '00FEF1': [
            'TwoSpeedAxleSwitch', 'ParkingBrakeSwitch', 'CruiseCtrlPauseSwitch',
            'ParkBrakeReleaseInhibitRq', 'WheelBasedVehicleSpeed', 'CruiseCtrlActive',
            'CruiseCtrlEnableSwitch', 'BrakeSwitch', 'ClutchSwitch', 'CruiseCtrlSetSwitch',
            'CruiseCtrlCoastSwitch', 'CruiseCtrlResumeSwitch', 'CruiseCtrlAccelerateSwitch',
            'CruiseCtrlSetSpeed', 'PTOGovernorState', 'CruiseCtrlStates',
            'EngIdleIncrementSwitch', 'EngIdleDecrementSwitch', 'EngTestModeSwitch',
            'EngShutdownOverrideSwitch'
        ],
        # Extend with additional PGN mappings as needed
    }

    j1939_map = load_j1939_map()
    agg_unique_spns = set()
    agg_pgn_occurrences = 0
    agg_pgn_mapping_combined = {}
    agg_total_pgn_h_count = 0  # Total PGN(H) rows across all files
    agg_unique_pgn_h_set = set()  # Unique PGN(H) hex values across all files

    for file in files:
        try:
            content = file.read().decode('utf-8')
            lines = content.strip().split('\n')

            # First, find "PGN(H)" column index from header
            pgn_h_col_index = None
            pgn_h_values = []  # All PGN(H) values (including duplicates)
            
            for i, line in enumerate(lines):
                columns = [col.strip() for col in line.split(',')]
                if not columns:
                    continue
                
                # Try to find header row with "PGN(H)" column
                if pgn_h_col_index is None:
                    for idx, col in enumerate(columns):
                        if col.upper() in ['PGN(H)', 'PGN_H', 'PGN H', 'PGN']:
                            pgn_h_col_index = idx
                            break
                    if pgn_h_col_index is not None:
                        continue  # Skip header row
                
                # Collect PGN(H) values (filter empty/null)
                if pgn_h_col_index is not None and len(columns) > pgn_h_col_index:
                    pgn_h_val = columns[pgn_h_col_index].strip()
                    if pgn_h_val and pgn_h_val.lower() not in ['', 'null', 'none', 'n/a']:
                        pgn_h_values.append(pgn_h_val)

            # Calculate PGN counts from PGN(H) column
            total_pgn_count_from_column = len(pgn_h_values)
            unique_pgn_count_from_column = len(set(pgn_h_values))

            pgns = []
            spns = []
            pgn_spn_mapping = defaultdict(list)
            current_pgn = None
            spn_index = 0

            for i, line in enumerate(lines):
                columns = line.strip().split(',')

                # Skip empty or insufficient lines
                if not columns or len(columns) < 2:
                    continue

                # PGN row (first column has index)
                if columns[0] and columns[0].isdigit():
                    if len(columns) > 5 and columns[5].strip():  # PGN(H) column
                        current_pgn = columns[5].strip()
                        pgn_id = len(pgns) + 1

                        is_hex = re.fullmatch(r'[0-9A-Fa-f]+', current_pgn) is not None
                        pgn_dec = int(current_pgn, 16) if is_hex else 0

                        pgn_info = {
                            'id': pgn_id,
                            'pgn_hex': current_pgn,
                            'pgn_dec': pgn_dec,
                            'name': columns[3] if len(columns) > 3 else f'PGN_{current_pgn}',
                            'message_id': columns[4] if len(columns) > 4 else '',
                            'source_addr': columns[6] if len(columns) > 6 else '',
                            'data_length': columns[9] if len(columns) > 9 else 0,
                            'data_bytes': columns[10] if len(columns) > 10 else ''
                        }
                        pgns.append(pgn_info)

                # SPN row (starts with empty first column)
                elif columns[0] == '' and len(columns) > 1 and columns[1].strip():
                    if columns[1] == 'Name':
                        continue

                    spn_index += 1
                    spn_info = {
                        'id': spn_index,
                        'name': columns[1].strip(),
                        'physical_value': columns[2].strip() if len(columns) > 2 else '',
                        'description': columns[3].strip() if len(columns) > 3 else '',
                        'comment': columns[4].strip() if len(columns) > 4 else '',
                        'raw_value': columns[5].strip() if len(columns) > 5 else '',
                        'start_bit': columns[6].strip() if len(columns) > 6 else '',
                        'bit_width': columns[7].strip() if len(columns) > 7 else '',
                        'factor': columns[8].strip() if len(columns) > 8 else '',
                        'offset': columns[9].strip() if len(columns) > 9 else '',
                        'pgn_hex': current_pgn,
                        'pgn_name': next((p['name'] for p in pgns if p['pgn_hex'] == current_pgn), 'Unknown')
                    }
                    spns.append(spn_info)

                    if current_pgn:
                        pgn_spn_mapping[current_pgn].append(spn_info)

            vehicle_name = file.name.split('.')[0].replace('_', ' ').replace('-', ' ')
            vehicle_id = len(vehicles) + 1

            vehicle = {
                'id': vehicle_id,
                'name': vehicle_name,
                'brand': extract_brand(vehicle_name),
                'filename': file.name,
                'source_file': file.name,
                'pgns': pgns,
                'spns': spns,
                'pgn_spn_mapping': dict(pgn_spn_mapping),
                'pgn_count': len(pgns),
                'spn_count': len(spns),
                'upload_date': datetime.now().isoformat(),
                'analysis_summary': {
                    'total_messages': len(pgns),
                    'total_parameters': len(spns),
                    'unique_pgns': len(set([p['pgn_hex'] for p in pgns])),
                    'unique_spns': len(set([s['name'] for s in spns])),
                    'pgns_with_spns': len(pgn_spn_mapping)
                },
                'pgn_h_column_stats': {
                    'total_pgn_count': total_pgn_count_from_column,  # Including duplicates
                    'unique_pgn_count': unique_pgn_count_from_column  # Distinct hex values
                }
            }

            vehicles.append(vehicle)
            total_spn_count += len(spns)
            total_pgn_count += len(pgns)

            # Aggregate PGN(H) column stats across all files
            agg_total_pgn_h_count += total_pgn_count_from_column
            agg_unique_pgn_h_set.update(pgn_h_values)

            # Standard map summary per vehicle
            standard_summary = summarize_pgns_with_map(pgns, j1939_map)
            vehicle['standard_summary'] = standard_summary

            # Aggregate across all vehicles (standard map)
            agg_pgn_occurrences += standard_summary.get("spn_occurrences", 0)
            for spn in standard_summary.get("pgn_spn_mapping", {}).values():
                for s in spn.get("spns", []):
                    agg_unique_spns.add(s["spn"])
            agg_pgn_mapping_combined.update(standard_summary.get("pgn_spn_mapping", {}))

        except Exception as e:
            errors.append({
                'filename': file.name,
                'error': str(e)
            })

    unique_spns_all = set()
    unique_pgns_all = set()
    for v in vehicles:
        unique_spns_all.update([s['name'] for s in v.get('spns', [])])
        unique_pgns_all.update([p['pgn_hex'] for p in v.get('pgns', [])])

    overall_standard = {
        "pgn_count": len(agg_pgn_mapping_combined),
        "spn_occurrences": agg_pgn_occurrences,
        "unique_spn_count": len(agg_unique_spns),
        "pgn_spn_mapping": agg_pgn_mapping_combined
    } if j1939_map else {}

    return JsonResponse({
        'status': 'success',
        'vehicles': vehicles,
        'errors': errors,
        'totals': {
            'total_vehicles': len(vehicles),
            'total_spn_count': total_spn_count,
            'total_pgn_count': total_pgn_count,
            'unique_spns_across_all': len(unique_spns_all),
            'unique_pgns_across_all': len(unique_pgns_all),
            'pgn_h_column_stats': {
                'total_pgn_count': agg_total_pgn_h_count,  # Total PGN(H) rows (including duplicates)
                'unique_pgn_count': len(agg_unique_pgn_h_set)  # Unique PGN(H) hex values
            }
        },
        'standard_summary': overall_standard
    })


def extract_brand(filename):
    """Extract vehicle brand from filename"""
    filename_lower = filename.lower()
    brands = {
        'daf': 'DAF',
        'hino': 'HINO',
        'volvo': 'Volvo',
        'scania': 'Scania',
        'mercedes': 'Mercedes',
        'man': 'MAN',
        'iveco': 'Iveco',
        'kenworth': 'Kenworth',
        'peterbilt': 'Peterbilt'
    }
    for brand_key, brand_name in brands.items():
        if brand_key in filename_lower:
            return brand_name
    return 'Unknown'
