'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '../../services/api';

// File extension display mapping (for UI display only, all file types are accepted)
const FILE_EXTENSIONS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'application/msword': 'DOC',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
  'application/octet-stream': 'File'
};

// Extension to MIME type mapping
const EXT_TO_MIME = {
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xls': 'application/vnd.ms-excel',
  'doc': 'application/msword',
  'zip': 'application/zip',
  'csv': 'text/csv',
  'txt': 'text/plain'
};

// Helper function to extract file info from URL or file object
const getFileInfo = (fileData) => {
  if (!fileData) return null;
  
  // If it's already an object with url property
  if (typeof fileData === 'object' && fileData.url) {
    return fileData;
  }
  
  // If it's a string URL
  if (typeof fileData === 'string') {
    const url = fileData;
    // Extract filename from URL
    const urlParts = url.split('/');
    const fullName = urlParts[urlParts.length - 1] || 'file';
    // Decode URL-encoded characters
    const decodedName = decodeURIComponent(fullName);
    // Get extension
    const extMatch = decodedName.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const mimeType = EXT_TO_MIME[ext] || 'application/octet-stream';
    
    return {
      url: url,
      name: decodedName,
      type: mimeType,
      size: 'Unknown size'
    };
  }
  
  return null;
};

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Calendar Component
const CalendarPicker = ({ 
  value, 
  onChange, 
  name, 
  placeholder = "Select date",
  minDate = null,
  maxDate = null 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Generate days in month
  const getDaysInMonth = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    // Previous month's days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }

    // Next month's days
    const totalCells = 42; // 6 weeks
    for (let i = 1; days.length < totalCells; i++) {
      days.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false
      });
    }

    return days;
  };

  // Handle date selection
  const handleDateSelect = (day, month, year) => {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    onChange({ target: { name, value: dateString } });
    setShowCalendar(false);
  };

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative" ref={calendarRef}>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={formatDateForDisplay(value)}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {showCalendar && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {getDaysInMonth().map((date, index) => {
              const isSelected = value && 
                new Date(value).getDate() === date.day &&
                new Date(value).getMonth() === date.month &&
                new Date(value).getFullYear() === date.year;
              
              const isToday = date.day === new Date().getDate() &&
                date.month === new Date().getMonth() &&
                date.year === new Date().getFullYear();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date.day, date.month, date.year)}
                  className={`
                    h-8 w-8 flex items-center justify-center rounded-full text-sm
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${!isSelected && date.isCurrentMonth ? 'text-gray-900 hover:bg-gray-100' : ''}
                    ${!isSelected && !date.isCurrentMonth ? 'text-gray-400 hover:bg-gray-50' : ''}
                    ${isToday && !isSelected ? 'border border-blue-500' : ''}
                  `}
                  disabled={!date.isCurrentMonth}
                >
                  {date.day}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="p-2 border-t">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const todayString = today.toISOString().split('T')[0];
                onChange({ target: { name, value: todayString } });
                setShowCalendar(false);
              }}
              className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeModule, setActiveModule] = useState('standard-files');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data states
    const [standardFiles, setStandardFiles] = useState([]);
    const [auxiliaryFiles, setAuxiliaryFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pgns, setPgns] = useState([]);
    const [spns, setSpns] = useState([]);

    // Modal states
    const [showStandardModal, setShowStandardModal] = useState(false);
    const [showAuxiliaryModal, setShowAuxiliaryModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showPgnModal, setShowPgnModal] = useState(false);
    const [showSpnModal, setShowSpnModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    
    // Detail View states (Standard Files)
    const [showDetailView, setShowDetailView] = useState(false);
    const [detailRecord, setDetailRecord] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Auxiliary File View states
    const [showAuxDetailView, setShowAuxDetailView] = useState(false);
    const [auxDetailRecord, setAuxDetailRecord] = useState(null); // Single result detail
    const [auxShowDeleteConfirm, setAuxShowDeleteConfirm] = useState(false);
    
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Form states
    const [standardForm, setStandardForm] = useState({
        Standard_No: '',
        Standard_Name: '',
        Issued_Date: '',
        Revised_Date: '',
        Resource: '',
        file: null,
        Note: ''
    });

    const [auxiliaryForm, setAuxiliaryForm] = useState({
        Title: '',
        Description: '',
        Published_Date: '',
        Resource: '',
        file: null,
        Linked_Standard: '',
        Note: ''
    });

    const [categoryForm, setCategoryForm] = useState({
        Keyword_EN: '',
        Keyword_CH: ''
    });

    const [pgnForm, setPgnForm] = useState({
        PGN_Number: '',
        Name_Description: '',
        Category: '',
        Linked_Standard: ''
    });

    const [spnForm, setSpnForm] = useState({
        SPN_Number: '',
        Name_Description: '',
        Linked_PGN: '',
        Category: '',
        Linked_Auxiliary: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/login');
            return;
        }
        loadInitialData();
    }, [user, router]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([
                fetchStandardFiles(),
                fetchAuxiliaryFiles(),
                fetchCategories(),
                fetchPgns(),
                fetchSpns()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load initial data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // API fetch functions
    const fetchStandardFiles = async () => {
        try {
            const response = await apiClient.get('/j1939/standard-files/');
            const data = response.data;
            setStandardFiles(Array.isArray(data) ? data : (data?.results || data?.data || []));
        } catch (error) {
            console.error('Error fetching standard files:', error);
            setStandardFiles([]);
        }
    };

    const fetchAuxiliaryFiles = async () => {
        try {
            const response = await apiClient.get('/j1939/auxiliary-files/');
            const data = response.data;
            setAuxiliaryFiles(Array.isArray(data) ? data : (data?.results || data?.data || []));
        } catch (error) {
            console.error('Error fetching auxiliary files:', error);
            setAuxiliaryFiles([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/j1939/categories/');
            const data = response.data;
            setCategories(Array.isArray(data) ? data : (data?.results || data?.data || []));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchPgns = async () => {
        try {
            const response = await apiClient.get('/j1939/pgns/');
            const data = response.data;
            setPgns(Array.isArray(data) ? data : (data?.results || data?.data || []));
        } catch (error) {
            console.error('Error fetching PGNs:', error);
            setPgns([]);
        }
    };

    const fetchSpns = async () => {
        try {
            const response = await apiClient.get('/j1939/spns/');
            const data = response.data;
            setSpns(Array.isArray(data) ? data : (data?.results || data?.data || []));
        } catch (error) {
            console.error('Error fetching SPNs:', error);
            setSpns([]);
        }
    };

    // File handling functions
    const handleFileInputChange = (setForm) => (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 100MB)
        if (file.size > MAX_FILE_SIZE) {
            setError('File size too large. Maximum size is 100MB.');
            e.target.value = '';
            return;
        }

        setForm(prev => ({
            ...prev,
            file: file
        }));
    };

    const handleViewFile = (fileData) => {
        setPreviewFile(fileData);
        setShowFilePreview(true);
    };

    // Handle View Detail for Standard File
    const handleViewDetail = (record) => {
        setDetailRecord(record);
        setShowDetailView(true);
    };

    // Handle file download - actual download functionality
    const handleDownloadFile = (fileData) => {
        // Get file info (handles both URL strings and objects)
        const fileInfo = getFileInfo(fileData);
        
        if (fileInfo && fileInfo.url) {
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = fileInfo.url;
            link.download = fileInfo.name || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (typeof fileData === 'string') {
            // Direct URL string - open in new tab
            window.open(fileData, '_blank');
        } else {
            alert('No file available for download.');
        }
    };

    // Handle delete from detail view
    const handleDeleteFromDetail = async () => {
        if (!detailRecord) return;
        
        const success = await handleDeleteRecord(
            '/j1939/standard-files/',
            detailRecord.id,
            'Standard file deleted successfully!'
        );
        
        if (success) {
            setShowDeleteConfirm(false);
            setShowDetailView(false);
            setDetailRecord(null);
        }
    };

    // Handle edit from detail view
    const handleEditFromDetail = () => {
        if (!detailRecord) return;
        
        setSelectedRecord(detailRecord);
        setStandardForm({
            Standard_No: detailRecord.Standard_No || '',
            Standard_Name: detailRecord.Standard_Name || '',
            Issued_Date: detailRecord.Issued_Date || '',
            Revised_Date: detailRecord.Revised_Date || '',
            Resource: detailRecord.Resource || '',
            file: null,
            Note: detailRecord.Note || ''
        });
        setShowDetailView(false);
        setShowStandardModal(true);
    };

    const getFileIcon = (fileType) => {
        const safeFileType = fileType || '';
        switch (safeFileType) {
            case 'application/pdf':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-excel':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/msword':
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            case 'application/zip':
            case 'application/x-zip-compressed':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            case 'text/csv':
                return (
                    <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    // Generic handlers
    const handleInputChange = (form, setForm) => (e) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            handleFileInputChange(setForm)(e);
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Build FormData when files are present so backend receives multipart
    const buildFormData = (form, endpoint) => {
        const formData = new FormData();
        
        if (endpoint === '/j1939/standard-files/') {
            formData.append('Standard_No', form.Standard_No || '');
            formData.append('Standard_Name', form.Standard_Name || '');
            if (form.Issued_Date) formData.append('Issued_Date', form.Issued_Date);
            if (form.Revised_Date) formData.append('Revised_Date', form.Revised_Date);
            if (form.Resource) formData.append('Resource', form.Resource);
            if (form.Note) formData.append('Note', form.Note);
            if (form.file) formData.append('File', form.file);
        } else if (endpoint === '/j1939/auxiliary-files/') {
            formData.append('Title', form.Title || '');
            if (form.Description) formData.append('Description', form.Description);
            if (form.Published_Date) formData.append('Published_Date', form.Published_Date);
            if (form.Resource) formData.append('Resource', form.Resource);
            if (form.Linked_Standard) formData.append('Linked_Standard', form.Linked_Standard);
            if (form.file) formData.append('File', form.file);
        }
        
        return formData;
    };

    const handleAddRecord = async (endpoint, form, resetForm, fetchData, successMessage) => {
        try {
            setError(null);
            const hasFile = !!form.file;
            let response;

            if (hasFile) {
                const formData = buildFormData(form, endpoint);
                response = await apiClient.post(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Remove file property from form before sending
                const { file, ...formWithoutFile } = form;
                response = await apiClient.post(endpoint, formWithoutFile);
            }
            
            const data = response.data || response;
            
            // Update state based on endpoint
            switch (endpoint) {
                case '/j1939/standard-files/':
                    setStandardFiles(prev => [...prev, data]);
                    break;
                case '/j1939/auxiliary-files/':
                    setAuxiliaryFiles(prev => [...prev, data]);
                    break;
                case '/j1939/categories/':
                    setCategories(prev => [...prev, data]);
                    break;
                case '/j1939/pgns/':
                    setPgns(prev => [...prev, data]);
                    break;
                case '/j1939/spns/':
                    setSpns(prev => [...prev, data]);
                    break;
            }
            
            resetForm();
            alert(successMessage);
            return true;
        } catch (error) {
            console.error(`Error adding record:`, error);
            let errorMessage = 'An error occurred';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const fieldErrors = Object.entries(data)
                        .map(([field, msgs]) => {
                            const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                            return `${field}: ${msgText}`;
                        })
                        .join('; ');
                    errorMessage = fieldErrors || JSON.stringify(data);
                } else {
                    errorMessage = String(data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(`Error: ${errorMessage}`);
            return false;
        }
    };

    const handleUpdateRecord = async (endpoint, form, recordId, resetForm, fetchData, successMessage) => {
        try {
            setError(null);
            const hasFile = !!form.file;
            let response;

            if (hasFile) {
                const formData = buildFormData(form, endpoint);
                response = await apiClient.put(`${endpoint}${recordId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Remove file property from form before sending
                const { file, ...formWithoutFile } = form;
                response = await apiClient.patch(`${endpoint}${recordId}/`, formWithoutFile);
            }
            
            const data = response.data || response;
            
            // Update local state
            const updatedData = { ...data, id: recordId };
            switch (endpoint) {
                case '/j1939/standard-files/':
                    setStandardFiles(prev => prev.map(item => item.id === recordId ? updatedData : item));
                    break;
                case '/j1939/auxiliary-files/':
                    setAuxiliaryFiles(prev => prev.map(item => item.id === recordId ? updatedData : item));
                    break;
                case '/j1939/categories/':
                    setCategories(prev => prev.map(item => item.id === recordId ? updatedData : item));
                    break;
                case '/j1939/pgns/':
                    setPgns(prev => prev.map(item => item.id === recordId ? updatedData : item));
                    break;
                case '/j1939/spns/':
                    setSpns(prev => prev.map(item => item.id === recordId ? updatedData : item));
                    break;
            }
            
            resetForm();
            alert(successMessage);
            return true;
        } catch (error) {
            console.error(`Error updating record:`, error);
            let errorMessage = 'An error occurred';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const fieldErrors = Object.entries(data)
                        .map(([field, msgs]) => {
                            const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                            return `${field}: ${msgText}`;
                        })
                        .join('; ');
                    errorMessage = fieldErrors || JSON.stringify(data);
                } else {
                    errorMessage = String(data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(`Error: ${errorMessage}`);
            return false;
        }
    };

    const handleDeleteRecord = async (endpoint, recordId, successMessage) => {
        try {
            setError(null);
            await apiClient.delete(`${endpoint}${recordId}/`);
            
            // Update local state
            switch (endpoint) {
                case '/j1939/standard-files/':
                    setStandardFiles(prev => prev.filter(item => item.id !== recordId));
                    break;
                case '/j1939/auxiliary-files/':
                    setAuxiliaryFiles(prev => prev.filter(item => item.id !== recordId));
                    break;
                case '/j1939/categories/':
                    setCategories(prev => prev.filter(item => item.id !== recordId));
                    break;
                case '/j1939/pgns/':
                    setPgns(prev => prev.filter(item => item.id !== recordId));
                    break;
                case '/j1939/spns/':
                    setSpns(prev => prev.filter(item => item.id !== recordId));
                    break;
            }
            
            alert(successMessage);
            return true;
        } catch (error) {
            console.error(`Error deleting record:`, error);
            let errorMessage = 'An error occurred';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const fieldErrors = Object.entries(data)
                        .map(([field, msgs]) => {
                            const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                            return `${field}: ${msgText}`;
                        })
                        .join('; ');
                    errorMessage = fieldErrors || JSON.stringify(data);
                } else {
                    errorMessage = String(data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(`Error: ${errorMessage}`);
            return false;
        }
    };

    // Standard Files Management
    const handleAddStandardFile = async (e) => {
        e.preventDefault();
        setError(null);

        // Frontend validation
        if (!standardForm.Standard_No || !standardForm.Standard_No.trim()) {
            setError('Standard No is required.');
            return;
        }
        
        // Check for duplicate Standard_No (only for new records, or if Standard_No changed during edit)
        const isDuplicate = standardFiles.some(
            file => file.Standard_No?.toLowerCase() === standardForm.Standard_No.trim().toLowerCase() 
                    && (!selectedRecord || file.id !== selectedRecord.id)
        );
        if (isDuplicate) {
            setError(`Error: Standard_No "${standardForm.Standard_No}" already exists. Please use a unique Standard No.`);
            return;
        }
        
        if (!standardForm.file && !selectedRecord) {
            setError('Please select a file before submitting.');
            return;
        }
        if (!standardForm.Issued_Date) {
            setError('Issued Date is required.');
            return;
        }

        if (selectedRecord) {
            // Update existing record
            const success = await handleUpdateRecord(
                '/j1939/standard-files/',
                standardForm,
                selectedRecord.id,
                () => setStandardForm({
                    Standard_No: '', Standard_Name: '', Issued_Date: '', Revised_Date: '', 
                    Resource: '', file: null, Note: ''
                }),
                null,
                'Standard file updated successfully!'
            );
            
            if (success) {
                setShowStandardModal(false);
                setSelectedRecord(null);
            }
        } else {
            // Add new record
            const success = await handleAddRecord(
                '/j1939/standard-files/',
                standardForm,
                () => setStandardForm({
                    Standard_No: '', Standard_Name: '', Issued_Date: '', Revised_Date: '', 
                    Resource: '', file: null, Note: ''
                }),
                null,
                'Standard file added successfully!'
            );
            
            if (success) {
                setShowStandardModal(false);
            }
        }
    };

    // Auxiliary Files Management
    const handleAddAuxiliaryFile = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Always use FormData for auxiliary files to avoid media type errors
        const formData = new FormData();
        formData.append('Title', auxiliaryForm.Title || '');
        if (auxiliaryForm.Description) formData.append('Description', auxiliaryForm.Description);
        if (auxiliaryForm.Published_Date) formData.append('Published_Date', auxiliaryForm.Published_Date);
        if (auxiliaryForm.Resource) formData.append('Resource', auxiliaryForm.Resource);
        if (auxiliaryForm.Linked_Standard) formData.append('Linked_Standard', auxiliaryForm.Linked_Standard);
        if (auxiliaryForm.Note) formData.append('Note', auxiliaryForm.Note);
        if (auxiliaryForm.file) formData.append('File', auxiliaryForm.file);
        
        try {
            let response;
            if (selectedRecord) {
                // Update existing record
                response = await apiClient.put(`/j1939/auxiliary-files/${selectedRecord.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const data = response.data || response;
                const updatedData = { ...data, id: selectedRecord.id };
                setAuxiliaryFiles(prev => prev.map(item => item.id === selectedRecord.id ? updatedData : item));
                
                alert('Auxiliary file updated successfully!');
                setShowAuxiliaryModal(false);
                setSelectedRecord(null);
            } else {
                // Add new record
                response = await apiClient.post('/j1939/auxiliary-files/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const data = response.data || response;
                setAuxiliaryFiles(prev => [...prev, data]);
                
                alert('Auxiliary file added successfully!');
                setShowAuxiliaryModal(false);
            }
            
            // Reset form
            setAuxiliaryForm({
                Title: '', Description: '', Published_Date: '', Resource: '', 
                file: null, Linked_Standard: '', Note: ''
            });
        } catch (error) {
            console.error('Error saving auxiliary file:', error);
            let errorMessage = 'An error occurred';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const fieldErrors = Object.entries(data)
                        .map(([field, msgs]) => {
                            const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                            return `${field}: ${msgText}`;
                        })
                        .join('; ');
                    errorMessage = fieldErrors || JSON.stringify(data);
                } else {
                    errorMessage = String(data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(`Error: ${errorMessage}`);
        }
    };

    // Handle delete auxiliary file from detail view
    const handleAuxDeleteFromDetail = async () => {
        if (!auxDetailRecord) return;
        
        const success = await handleDeleteRecord(
            '/j1939/auxiliary-files/',
            auxDetailRecord.id,
            'Auxiliary file deleted successfully!'
        );
        
        if (success) {
            setAuxShowDeleteConfirm(false);
            setShowAuxDetailView(false);
            setAuxDetailRecord(null);
        }
    };

    // Handle edit from auxiliary detail view
    const handleAuxEditFromDetail = () => {
        if (!auxDetailRecord) return;
        
        setSelectedRecord(auxDetailRecord);
        setAuxiliaryForm({
            Title: auxDetailRecord.Title || '',
            Description: auxDetailRecord.Description || '',
            Published_Date: auxDetailRecord.Published_Date || '',
            Resource: auxDetailRecord.Resource || '',
            file: null,
            Linked_Standard: auxDetailRecord.Linked_Standard || '',
            Note: auxDetailRecord.Note || ''
        });
        setShowAuxDetailView(false);
        setShowAuxiliaryModal(true);
    };

    // Category Management
    const handleAddCategory = async (e) => {
        e.preventDefault();
        
        if (selectedRecord) {
            // Update existing record
            const success = await handleUpdateRecord(
                '/j1939/categories/',
                categoryForm,
                selectedRecord.id,
                () => setCategoryForm({ Keyword_EN: '', Keyword_CH: '' }),
                null,
                'Category updated successfully!'
            );
            
            if (success) {
                setShowCategoryModal(false);
                setSelectedRecord(null);
            }
        } else {
            // Add new record
            const success = await handleAddRecord(
                '/j1939/categories/',
                categoryForm,
                () => setCategoryForm({ Keyword_EN: '', Keyword_CH: '' }),
                null,
                'Category added successfully!'
            );
            
            if (success) {
                setShowCategoryModal(false);
            }
        }
    };

    // PGN Management
    const handleAddPgn = async (e) => {
        e.preventDefault();
        
        if (selectedRecord) {
            // Update existing record
            const success = await handleUpdateRecord(
                '/j1939/pgns/',
                pgnForm,
                selectedRecord.id,
                () => setPgnForm({
                    PGN_Number: '', Name_Description: '', Category: '', Linked_Standard: ''
                }),
                null,
                'PGN updated successfully!'
            );
            
            if (success) {
                setShowPgnModal(false);
                setSelectedRecord(null);
            }
        } else {
            // Add new record
            const success = await handleAddRecord(
                '/j1939/pgns/',
                pgnForm,
                () => setPgnForm({
                    PGN_Number: '', Name_Description: '', Category: '', Linked_Standard: ''
                }),
                null,
                'PGN added successfully!'
            );
            
            if (success) {
                setShowPgnModal(false);
            }
        }
    };

    // SPN Management
    const handleAddSpn = async (e) => {
        e.preventDefault();
        
        if (selectedRecord) {
            // Update existing record
            const success = await handleUpdateRecord(
                '/j1939/spns/',
                spnForm,
                selectedRecord.id,
                () => setSpnForm({
                    SPN_Number: '', Name_Description: '', Linked_PGN: '', Category: '', Linked_Auxiliary: ''
                }),
                null,
                'SPN updated successfully!'
            );
            
            if (success) {
                setShowSpnModal(false);
                setSelectedRecord(null);
            }
        } else {
            // Add new record
            const success = await handleAddRecord(
                '/j1939/spns/',
                spnForm,
                () => setSpnForm({
                    SPN_Number: '', Name_Description: '', Linked_PGN: '', Category: '', Linked_Auxiliary: ''
                }),
                null,
                'SPN added successfully!'
            );
            
            if (success) {
                setShowSpnModal(false);
            }
        }
    };

    const filteredStandardFiles = standardFiles.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return searchTerm === '' || 
            (item.Standard_No && item.Standard_No.toLowerCase().includes(searchLower)) ||
            (item.Standard_Name && item.Standard_Name.toLowerCase().includes(searchLower));
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading SAE J1939 Management System...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">SAE J1939 Management System</h1>
                            <p className="text-gray-600">Welcome, {user?.first_name || user?.username}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'standard-files', name: 'Standard Files' },
                            { id: 'auxiliary-files', name: 'Auxiliary Files' },
                            { id: 'categories', name: 'Categories' },
                            { id: 'pgn-management', name: 'PGN Management' },
                            { id: 'spn-management', name: 'SPN Management' },
                            { id: 'search-all', name: 'Search All' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeModule === item.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Standard Files Module */}
                {activeModule === 'standard-files' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">SAE J1939 Standard Files</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setStandardForm({
                                        Standard_No: '', Standard_Name: '', Issued_Date: '', Revised_Date: '', 
                                        Resource: '', file: null, Note: ''
                                    });
                                    setShowStandardModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New Standard File
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search standard files..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Standard Files List */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Standard Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Standard Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                File
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Issued Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Revised Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStandardFiles.map((file) => {
                                            const fileInfo = getFileInfo(file.File);
                                            return (
                                            <tr key={file.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {file.Standard_No || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {file.Standard_Name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {fileInfo ? (
                                                        <div className="flex items-center space-x-2">
                                                            {getFileIcon(fileInfo.type)}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {fileInfo.name || 'Unnamed file'}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {FILE_EXTENSIONS[fileInfo.type] || 'File'} • {fileInfo.size || 'Unknown size'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No file</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Issued_Date || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Revised_Date || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetail(file)}
                                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                                    >
                                                        View
                                                    </button>
                                                    {fileInfo && (
                                                        <button
                                                            onClick={() => handleDownloadFile(file.File)}
                                                            className="text-green-600 hover:text-green-900 mr-2"
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecord(file);
                                                            setStandardForm({
                                                                Standard_No: file.Standard_No || '',
                                                                Standard_Name: file.Standard_Name || '',
                                                                Issued_Date: file.Issued_Date || '',
                                                                Revised_Date: file.Revised_Date || '',
                                                                Resource: file.Resource || '',
                                                                file: null,
                                                                Note: file.Note || ''
                                                            });
                                                            setShowStandardModal(true);
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-900 mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this standard file?')) {
                                                                handleDeleteRecord(
                                                                    '/j1939/standard-files/',
                                                                    file.id,
                                                                    'Standard file deleted successfully!'
                                                                );
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Auxiliary Files Module */}
                {activeModule === 'auxiliary-files' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Auxiliary J1939 Related Files</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setAuxiliaryForm({
                                        Title: '', Description: '', Published_Date: '', Resource: '', 
                                        file: null, Linked_Standard: '', Note: ''
                                    });
                                    setShowAuxiliaryModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New Auxiliary File
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search auxiliary files..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Auxiliary Files List */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                File Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                File
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Linked Standard
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Published Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {auxiliaryFiles.filter(item => {
                                            const searchLower = searchTerm.toLowerCase();
                                            return searchTerm === '' || 
                                                (item.Title && item.Title.toLowerCase().includes(searchLower)) ||
                                                (item.Description && item.Description.toLowerCase().includes(searchLower));
                                        }).map((file) => {
                                            const auxFileInfo = getFileInfo(file.File);
                                            return (
                                            <tr key={file.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {file.Title || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {auxFileInfo ? (
                                                        <div className="flex items-center space-x-2">
                                                            {getFileIcon(auxFileInfo.type)}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {auxFileInfo.name || 'Unnamed file'}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {FILE_EXTENSIONS[auxFileInfo.type] || 'File'} • {auxFileInfo.size || 'Unknown size'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No file</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {file.Linked_Standard ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                📎 {standardFiles.find(std => std.id === file.Linked_Standard)?.Standard_No || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Not linked</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Published_Date || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setAuxDetailRecord(file);
                                                            setShowAuxDetailView(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                                    >
                                                        View
                                                    </button>
                                                    {auxFileInfo && (
                                                        <button
                                                            onClick={() => handleDownloadFile(file.File)}
                                                            className="text-green-600 hover:text-green-900 mr-2"
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecord(file);
                                                            setAuxiliaryForm({
                                                                Title: file.Title || '',
                                                                Description: file.Description || '',
                                                                Published_Date: file.Published_Date || '',
                                                                Resource: file.Resource || '',
                                                                file: null,
                                                                Linked_Standard: file.Linked_Standard || '',
                                                                Note: file.Note || ''
                                                            });
                                                            setShowAuxiliaryModal(true);
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-900 mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAuxDetailRecord(file);
                                                            setAuxShowDeleteConfirm(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Module */}
                {activeModule === 'categories' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">PGN/SPN Categories</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setCategoryForm({ Keyword_EN: '', Keyword_CH: '' });
                                    setShowCategoryModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New Category
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keyword (EN)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keyword (CH)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {category.Keyword_EN || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {category.Keyword_CH || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(category);
                                                        setCategoryForm({
                                                            Keyword_EN: category.Keyword_EN || '',
                                                            Keyword_CH: category.Keyword_CH || ''
                                                        });
                                                        setShowCategoryModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this category?')) {
                                                            handleDeleteRecord(
                                                                '/j1939/categories/',
                                                                category.id,
                                                                'Category deleted successfully!'
                                                            );
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PGN Management Module */}
                {activeModule === 'pgn-management' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">PGN Management</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setPgnForm({
                                        PGN_Number: '', Name_Description: '', Category: '', Linked_Standard: ''
                                    });
                                    setShowPgnModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New PGN
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PGN Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name/Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pgns.map((pgn) => (
                                        <tr key={pgn.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {pgn.PGN_Number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {pgn.Name_Description || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {categories.find(cat => cat.id === pgn.Category)?.Keyword_EN || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(pgn);
                                                        setPgnForm({
                                                            PGN_Number: pgn.PGN_Number || '',
                                                            Name_Description: pgn.Name_Description || '',
                                                            Category: pgn.Category || '',
                                                            Linked_Standard: pgn.Linked_Standard || ''
                                                        });
                                                        setShowPgnModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this PGN?')) {
                                                            handleDeleteRecord(
                                                                '/j1939/pgns/',
                                                                pgn.id,
                                                                'PGN deleted successfully!'
                                                            );
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SPN Management Module */}
                {activeModule === 'spn-management' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">SPN Management</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setSpnForm({
                                        SPN_Number: '', Name_Description: '', Linked_PGN: '', Category: '', Linked_Auxiliary: ''
                                    });
                                    setShowSpnModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New SPN
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SPN Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name/Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PGN
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {spns.map((spn) => (
                                        <tr key={spn.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {spn.SPN_Number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {spn.Name_Description || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pgns.find(pgn => pgn.id === spn.Linked_PGN)?.PGN_Number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {categories.find(cat => cat.id === spn.Category)?.Keyword_EN || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(spn);
                                                        setSpnForm({
                                                            SPN_Number: spn.SPN_Number || '',
                                                            Name_Description: spn.Name_Description || '',
                                                            Linked_PGN: spn.Linked_PGN || '',
                                                            Category: spn.Category || '',
                                                            Linked_Auxiliary: spn.Linked_Auxiliary || ''
                                                        });
                                                        setShowSpnModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this SPN?')) {
                                                            handleDeleteRecord(
                                                                '/j1939/spns/',
                                                                spn.id,
                                                                'SPN deleted successfully!'
                                                            );
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Search All Module */}
                {activeModule === 'search-all' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Search All J1939 Entities</h2>
                            <p className="text-gray-600">Search across all SAE J1939 databases and records</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Enter search term across all databases..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">Standard Files</h3>
                                    <p className="text-gray-600 text-sm">Search SAE J1939 standard documents</p>
                                    <p className="text-sm text-blue-600 mt-2">{standardFiles.length} records</p>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">Auxiliary Files</h3>
                                    <p className="text-gray-600 text-sm">Search supporting documents</p>
                                    <p className="text-sm text-blue-600 mt-2">{auxiliaryFiles.length} records</p>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">PGNs</h3>
                                    <p className="text-gray-600 text-sm">Search Parameter Group Numbers</p>
                                    <p className="text-sm text-blue-600 mt-2">{pgns.length} records</p>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">SPNs</h3>
                                    <p className="text-gray-600 text-sm">Search Suspect Parameter Numbers</p>
                                    <p className="text-sm text-blue-600 mt-2">{spns.length} records</p>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">Categories</h3>
                                    <p className="text-gray-600 text-sm">Search PGN/SPN categories</p>
                                    <p className="text-sm text-blue-600 mt-2">{categories.length} records</p>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h3 className="font-semibold text-lg mb-2">Advanced Search</h3>
                                    <p className="text-gray-600 text-sm">Combine multiple search criteria</p>
                                    <p className="text-sm text-blue-600 mt-2">All entities</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Standard File Modal */}
            {showStandardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRecord ? 'Edit Standard File' : 'Add New Standard File'}
                            </h3>
                            <button
                                onClick={() => setShowStandardModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddStandardFile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Number *</label>
                                    <input
                                        type="text"
                                        name="Standard_No"
                                        required
                                        value={standardForm.Standard_No}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., J1939-71 MAR2011"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Name *</label>
                                    <input
                                        type="text"
                                        name="Standard_Name"
                                        required
                                        value={standardForm.Standard_Name}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Vehicle"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date *</label>
                                    <CalendarPicker
                                        value={standardForm.Issued_Date}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        name="Issued_Date"
                                        placeholder="Select issued date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Revised Date</label>
                                    <CalendarPicker
                                        value={standardForm.Revised_Date}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        name="Revised_Date"
                                        placeholder="Select revised date"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
                                    <input
                                        type="url"
                                        name="Resource"
                                        value={standardForm.Resource}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Link to external resource"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Upload File - Max 100MB {!selectedRecord && '*'}
                                    </label>
                                    
                                    {/* Show existing file when editing */}
                                    {selectedRecord && selectedRecord.File && !standardForm.file && (
                                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const existingFile = getFileInfo(selectedRecord.File);
                                                        return existingFile ? (
                                                            <>
                                                                {getFileIcon(existingFile.type)}
                                                                <div>
                                                                    <p className="text-sm font-medium text-green-800">Current File: {existingFile.name}</p>
                                                                    <p className="text-xs text-green-600">{FILE_EXTENSIONS[existingFile.type] || 'File'}</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-green-700">File exists</p>
                                                        );
                                                    })()}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadFile(selectedRecord.File)}
                                                    className="text-green-700 hover:text-green-900 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">Upload a new file below to replace this one, or leave empty to keep current file</p>
                                        </div>
                                    )}
                                    
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            name="file"
                                            onChange={handleInputChange(standardForm, setStandardForm)}
                                            className="w-full px-3 py-2"
                                            required={!selectedRecord}
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            All file types supported
                                        </p>
                                        {standardForm.file && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                                <div className="flex items-center">
                                                    {getFileIcon(standardForm.file.type)}
                                                    <div className="ml-2">
                                                        <p className="text-sm font-medium">{standardForm.file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(standardForm.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Comments</label>
                                    <textarea
                                        name="Note"
                                        value={standardForm.Note}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Additional notes or comments..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Update Standard File' : 'Add Standard File'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowStandardModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Auxiliary File Modal */}
            {showAuxiliaryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRecord ? 'Edit Auxiliary J1939 File' : 'Add Auxiliary J1939 Related File'}
                            </h3>
                            <button
                                onClick={() => setShowAuxiliaryModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddAuxiliaryFile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File Name / Title *</label>
                                    <input
                                        type="text"
                                        name="Title"
                                        required
                                        value={auxiliaryForm.Title}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., GB17691-2018 Standard"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
                                    <CalendarPicker
                                        value={auxiliaryForm.Published_Date}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        name="Published_Date"
                                        placeholder="Select published date"
                                    />
                                </div>
                                
                                {/* LINKING SELECTOR */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Standard File (SAE J1939)</label>
                                    <div className="flex gap-2">
                                        <select
                                            name="Linked_Standard"
                                            value={auxiliaryForm.Linked_Standard}
                                            onChange={(e) => {
                                                setAuxiliaryForm(prev => ({
                                                    ...prev,
                                                    Linked_Standard: e.target.value ? parseInt(e.target.value) : ''
                                                }));
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- No Link --</option>
                                            {standardFiles.map((std) => (
                                                <option key={std.id} value={std.id}>
                                                    {std.Standard_No} - {std.Standard_Name}
                                                </option>
                                            ))}
                                        </select>
                                        {auxiliaryForm.Linked_Standard && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAuxiliaryForm(prev => ({...prev, Linked_Standard: ''}));
                                                }}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                            >
                                                Unlink
                                            </button>
                                        )}
                                    </div>
                                    {auxiliaryForm.Linked_Standard && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                            <p className="text-sm text-blue-800">
                                                📎 Linked to: {standardFiles.find(s => s.id === auxiliaryForm.Linked_Standard)?.Standard_No}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="Description"
                                        value={auxiliaryForm.Description}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Detailed description of this auxiliary file"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL (optional)</label>
                                    <input
                                        type="url"
                                        name="Resource"
                                        value={auxiliaryForm.Resource}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/resource"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Upload File - Max 100MB {!selectedRecord && '*'}
                                    </label>
                                    
                                    {/* Show existing file when editing */}
                                    {selectedRecord && selectedRecord.File && !auxiliaryForm.file && (
                                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const existingAuxFile = getFileInfo(selectedRecord.File);
                                                        return existingAuxFile ? (
                                                            <>
                                                                {getFileIcon(existingAuxFile.type)}
                                                                <div>
                                                                    <p className="text-sm font-medium text-green-800">Current File: {existingAuxFile.name}</p>
                                                                    <p className="text-xs text-green-600">{FILE_EXTENSIONS[existingAuxFile.type] || 'File'}</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-green-700">File exists</p>
                                                        );
                                                    })()}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadFile(selectedRecord.File)}
                                                    className="text-green-700 hover:text-green-900 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">Upload a new file below to replace this one, or leave empty to keep current file</p>
                                        </div>
                                    )}
                                    
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            name="file"
                                            onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                            className="w-full px-3 py-2"
                                            required={!selectedRecord}
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            All file types supported
                                        </p>
                                        {auxiliaryForm.file && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                                <div className="flex items-center">
                                                    {getFileIcon(auxiliaryForm.file.type)}
                                                    <div className="ml-2">
                                                        <p className="text-sm font-medium">{auxiliaryForm.file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {(auxiliaryForm.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Comments</label>
                                    <textarea
                                        name="Note"
                                        value={auxiliaryForm.Note}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Additional notes or comments..."
                                    />
                                </div>
                                
                                {/* Auto-filled fields display */}
                                <div className="md:col-span-2 bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Keyin Person:</span> {user?.username || user?.first_name || 'Current User'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Keyin Date:</span> {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Save Changes' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAuxiliaryModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRecord ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keyword (EN) *</label>
                                    <input
                                        type="text"
                                        name="Keyword_EN"
                                        required
                                        value={categoryForm.Keyword_EN}
                                        onChange={handleInputChange(categoryForm, setCategoryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="English keyword"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keyword (CH)</label>
                                    <input
                                        type="text"
                                        name="Keyword_CH"
                                        value={categoryForm.Keyword_CH}
                                        onChange={handleInputChange(categoryForm, setCategoryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Chinese keyword"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Update Category' : 'Add Category'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PGN Modal */}
            {showPgnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRecord ? 'Edit PGN' : 'Add New PGN'}
                            </h3>
                            <button
                                onClick={() => setShowPgnModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddPgn}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PGN Number *</label>
                                    <input
                                        type="text"
                                        name="PGN_Number"
                                        required
                                        value={pgnForm.PGN_Number}
                                        onChange={handleInputChange(pgnForm, setPgnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 65262"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name/Description *</label>
                                    <textarea
                                        name="Name_Description"
                                        required
                                        value={pgnForm.Name_Description}
                                        onChange={handleInputChange(pgnForm, setPgnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        placeholder="PGN description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="Category"
                                        value={pgnForm.Category}
                                        onChange={handleInputChange(pgnForm, setPgnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.Keyword_EN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked Standard</label>
                                    <select
                                        name="Linked_Standard"
                                        value={pgnForm.Linked_Standard}
                                        onChange={handleInputChange(pgnForm, setPgnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Standard</option>
                                        {standardFiles.map((std) => (
                                            <option key={std.id} value={std.id}>
                                                {std.Standard_No} - {std.Standard_Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Update PGN' : 'Add PGN'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPgnModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SPN Modal */}
            {showSpnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRecord ? 'Edit SPN' : 'Add New SPN'}
                            </h3>
                            <button
                                onClick={() => setShowSpnModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddSpn}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SPN Number *</label>
                                    <input
                                        type="text"
                                        name="SPN_Number"
                                        required
                                        value={spnForm.SPN_Number}
                                        onChange={handleInputChange(spnForm, setSpnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 1214"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name/Description *</label>
                                    <textarea
                                        name="Name_Description"
                                        required
                                        value={spnForm.Name_Description}
                                        onChange={handleInputChange(spnForm, setSpnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        placeholder="SPN description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked PGN</label>
                                    <select
                                        name="Linked_PGN"
                                        value={spnForm.Linked_PGN}
                                        onChange={handleInputChange(spnForm, setSpnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select PGN</option>
                                        {pgns.map((pgn) => (
                                            <option key={pgn.id} value={pgn.id}>
                                                {pgn.PGN_Number} - {pgn.Name_Description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="Category"
                                        value={spnForm.Category}
                                        onChange={handleInputChange(spnForm, setSpnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.Keyword_EN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked Auxiliary</label>
                                    <select
                                        name="Linked_Auxiliary"
                                        value={spnForm.Linked_Auxiliary}
                                        onChange={handleInputChange(spnForm, setSpnForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Auxiliary File</option>
                                        {auxiliaryFiles.map((aux) => (
                                            <option key={aux.id} value={aux.id}>
                                                {aux.Title || aux.File_Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Update SPN' : 'Add SPN'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSpnModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* File Preview Modal */}
            {showFilePreview && previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">File Preview</h3>
                            <button
                                onClick={() => setShowFilePreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                {getFileIcon(previewFile.type)}
                                <div>
                                    <h4 className="text-lg font-medium">{previewFile.name}</h4>
                                    <div className="text-sm text-gray-500">
                                        <span className="mr-3">Type: {FILE_EXTENSIONS[previewFile.type] || previewFile.type}</span>
                                        <span className="mr-3">Size: {previewFile.size}</span>
                                        {previewFile.uploaded_date && (
                                            <span>Uploaded: {previewFile.uploaded_date}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleDownloadFile(previewFile)}
                                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download File
                                    </button>
                                    <button
                                        onClick={() => setShowFilePreview(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                
                                {previewFile.type === 'application/pdf' && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">PDF Preview (Mock - In real app would show actual PDF)</div>
                                        <div className="border rounded p-8 bg-white text-center">
                                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-lg font-medium">{previewFile.name}</p>
                                            <p className="text-gray-600">This is a mock preview. In a real application, this would display the actual PDF content.</p>
                                            <p className="text-sm text-gray-500 mt-2">File size: {previewFile.size}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {(previewFile.type && (previewFile.type.includes('spreadsheet') || previewFile.type.includes('excel'))) && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">Spreadsheet Preview</div>
                                        <div className="border rounded p-8 bg-white text-center">
                                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-lg font-medium">{previewFile.name}</p>
                                            <p className="text-gray-600">Excel/Spreadsheet file ready for download.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {previewFile.type && previewFile.type.includes('word') && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">Document Preview</div>
                                        <div className="border rounded p-8 bg-white text-center">
                                            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-lg font-medium">{previewFile.name}</p>
                                            <p className="text-gray-600">Word document ready for download.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {(previewFile.type && (previewFile.type.includes('zip') || previewFile.type.includes('compressed'))) && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">Archive File</div>
                                        <div className="border rounded p-8 bg-white text-center">
                                            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-lg font-medium">{previewFile.name}</p>
                                            <p className="text-gray-600">ZIP archive containing multiple files.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {previewFile.type && previewFile.type.includes('csv') && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">CSV Data File</div>
                                        <div className="border rounded p-8 bg-white text-center">
                                            <svg className="w-16 h-16 text-purple-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-lg font-medium">{previewFile.name}</p>
                                            <p className="text-gray-600">Comma-separated values data file.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard File Detail View Modal */}
            {showDetailView && detailRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Standard File Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDetailView(false);
                                        setDetailRecord(null);
                                    }}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Standard Information Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Standard Information
                                </h3>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Standard No */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Standard No</label>
                                            <p className="text-lg font-semibold text-gray-900">{detailRecord.Standard_No || 'N/A'}</p>
                                        </div>
                                        
                                        {/* Standard Name */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Standard Name</label>
                                            <p className="text-lg font-semibold text-gray-900">{detailRecord.Standard_Name || 'N/A'}</p>
                                        </div>
                                        
                                        {/* Issued Date */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Issued Date</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {detailRecord.Issued_Date || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        {/* Revised Date */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Revised Date</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {detailRecord.Revised_Date || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        {/* Resource URL */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Resource (URL)</label>
                                            {detailRecord.Resource ? (
                                                <a 
                                                    href={detailRecord.Resource.startsWith('http') ? detailRecord.Resource : `https://${detailRecord.Resource}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    {detailRecord.Resource}
                                                </a>
                                            ) : (
                                                <p className="text-gray-400">No resource link provided</p>
                                            )}
                                        </div>
                                        
                                        {/* Uploaded File */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-2">Uploaded File</label>
                                            {(() => {
                                                const detailFileInfo = getFileInfo(detailRecord.File);
                                                return detailFileInfo ? (
                                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(detailFileInfo.type)}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{detailFileInfo.name || 'Unnamed file'}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {FILE_EXTENSIONS[detailFileInfo.type] || 'File'} • {detailFileInfo.size || 'Unknown size'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadFile(detailRecord.File)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400">No file uploaded</p>
                                            );
                                            })()}
                                        </div>
                                        
                                        {/* Uploaded By */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Uploaded By (Keyin Person)</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {detailRecord.uploaded_by || detailRecord.Keyin_Person || detailRecord.created_by || user?.username || 'Unknown'}
                                            </p>
                                        </div>
                                        
                                        {/* Created At */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {detailRecord.created_at 
                                                    ? new Date(detailRecord.created_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : detailRecord.Issued_Date || 'N/A'
                                                }
                                            </p>
                                        </div>
                                        
                                        {/* Notes */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {detailRecord.Note || <span className="text-gray-400">No notes available</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t">
                                <button
                                    onClick={handleEditFromDetail}
                                    className="flex-1 min-w-[120px] bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex-1 min-w-[120px] bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                                
                                {getFileInfo(detailRecord.File) && (
                                    <button
                                        onClick={() => handleDownloadFile(detailRecord.File)}
                                        className="flex-1 min-w-[120px] bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => {
                                        setShowDetailView(false);
                                        setDetailRecord(null);
                                    }}
                                    className="flex-1 min-w-[120px] bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Standard File</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this record?<br/>
                                <span className="font-semibold text-gray-900">{detailRecord?.Standard_No}</span><br/>
                                <span className="text-sm text-red-500">This action cannot be undone.</span>
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFromDetail}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Auxiliary File Detail View Modal */}
            {showAuxDetailView && auxDetailRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Auxiliary J1939 Related File Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAuxDetailView(false);
                                        setAuxDetailRecord(null);
                                    }}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* File Information Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    File Information
                                </h3>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* File Name */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">File Name</label>
                                            <p className="text-lg font-semibold text-gray-900">{auxDetailRecord.Title || 'N/A'}</p>
                                        </div>
                                        
                                        {/* Description */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                            <p className="text-gray-900">{auxDetailRecord.Description || 'N/A'}</p>
                                        </div>
                                        
                                        {/* Published Date */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Published Date</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {auxDetailRecord.Published_Date || 'N/A'}
                                            </p>
                                        </div>
                                        
                                        {/* Resource URL */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Resource (URL)</label>
                                            {auxDetailRecord.Resource ? (
                                                <a 
                                                    href={auxDetailRecord.Resource.startsWith('http') ? auxDetailRecord.Resource : `https://${auxDetailRecord.Resource}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    {auxDetailRecord.Resource}
                                                </a>
                                            ) : (
                                                <p className="text-gray-400">No resource link provided</p>
                                            )}
                                        </div>
                                        
                                        {/* Linked Standard */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Linked Standard File</label>
                                            {auxDetailRecord.Linked_Standard ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    📎 {standardFiles.find(std => std.id === auxDetailRecord.Linked_Standard)?.Standard_No || 'Unknown'} - 
                                                    {standardFiles.find(std => std.id === auxDetailRecord.Linked_Standard)?.Standard_Name || ''}
                                                </span>
                                            ) : (
                                                <p className="text-gray-400">Not linked to any standard file</p>
                                            )}
                                        </div>
                                        
                                        {/* Uploaded File */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-2">Uploaded File</label>
                                            {(() => {
                                                const auxFileInfoDetail = getFileInfo(auxDetailRecord.File);
                                                return auxFileInfoDetail ? (
                                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(auxFileInfoDetail.type)}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{auxFileInfoDetail.name || 'Unnamed file'}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {FILE_EXTENSIONS[auxFileInfoDetail.type] || 'File'} • {auxFileInfoDetail.size || 'Unknown size'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadFile(auxDetailRecord.File)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400">No file uploaded</p>
                                            );
                                            })()}
                                        </div>
                                        
                                        {/* Keyin Person */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Keyin Person (Upload person)</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {auxDetailRecord.uploaded_by || auxDetailRecord.Keyin_Person || user?.username || 'Unknown'}
                                            </p>
                                        </div>
                                        
                                        {/* Keyin Date */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Keyin Date</label>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {auxDetailRecord.created_at 
                                                    ? new Date(auxDetailRecord.created_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : auxDetailRecord.Published_Date || 'N/A'
                                                }
                                            </p>
                                        </div>
                                        
                                        {/* Notes */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {auxDetailRecord.Note || <span className="text-gray-400">No notes available</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t">
                                <button
                                    onClick={handleAuxEditFromDetail}
                                    className="flex-1 min-w-[120px] bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                
                                <button
                                    onClick={() => setAuxShowDeleteConfirm(true)}
                                    className="flex-1 min-w-[120px] bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                                
                                {getFileInfo(auxDetailRecord.File) && (
                                    <button
                                        onClick={() => handleDownloadFile(auxDetailRecord.File)}
                                        className="flex-1 min-w-[120px] bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => {
                                        setShowAuxDetailView(false);
                                        setAuxDetailRecord(null);
                                    }}
                                    className="flex-1 min-w-[120px] bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Auxiliary Delete Confirmation Modal - Green Popup */}
            {auxShowDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-t-4 border-green-500">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Auxiliary J1939 File</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this file?<br/>
                                <span className="font-semibold text-gray-900">{auxDetailRecord?.Title}</span><br/>
                                <span className="text-sm text-red-500">This action cannot be undone.</span>
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setAuxShowDeleteConfirm(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={handleAuxDeleteFromDetail}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}