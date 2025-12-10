This README explains the new J1939 upload endpoint and how to set up dependencies and run migrations.

1. Install new Python dependencies into your project's virtualenv:

   # Activate venv (Windows PowerShell)
   & ".\.venv\Scripts\Activate.ps1"
   cd backend
   pip install -r requirements.txt

2. Run migrations:

   python manage.py makemigrations Main
   python manage.py migrate

3. Start backend dev server:

   python manage.py runserver

4. Start frontend:

   cd ..\frontend
   npm install
   npm run dev

5. Upload files using the Upload page in the frontend or POST to /api/upload/ using multipart/form-data with field name 'file'.

Notes:
- The parser uses pandas + openpyxl and falls back to openpyxl-only parsing if pandas fails to read sheets.
- For production tighten CSRF and authentication; remove csrf_exempt and use proper auth.
