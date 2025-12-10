'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '../../services/api';

// File type constants
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
  'application/zip',
  'application/x-zip-compressed',
  'text/csv'
];

const FILE_EXTENSIONS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'application/msword': 'DOC',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'text/csv': 'CSV'
};

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

export default function J1939ManagementSystem() {
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
        Linked_Standard: ''
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
            // Don't set error if endpoints are just not available
        } finally {
            setLoading(false);
        }
    };

    // API fetch functions
    const fetchStandardFiles = async () => {
        try {
            console.log('Fetching standard files from:', `/j1939/standard-files/`);
            const response = await apiClient.get('/j1939/standard-files/');
            console.log('Standard files response:', response);
            setStandardFiles(Array.isArray(response.data) ? response.data : response.data?.results || []);
        } catch (error) {
            console.error('Error fetching standard files:', error.response?.status, error.message);
            // Set empty array on error instead of throwing
            setStandardFiles([]);
        }
    };

    const fetchAuxiliaryFiles = async () => {
        try {
            console.log('Fetching auxiliary files from:', `/j1939/auxiliary-files/`);
            const response = await apiClient.get('/j1939/auxiliary-files/');
            console.log('Auxiliary files response:', response);
            setAuxiliaryFiles(Array.isArray(response.data) ? response.data : response.data?.results || []);
        } catch (error) {
            console.error('Error fetching auxiliary files:', error.response?.status, error.message);
            setAuxiliaryFiles([]);
        }
    };

    const fetchCategories = async () => {
        try {
            console.log('Fetching categories from:', `/j1939/categories/`);
            const response = await apiClient.get('/j1939/categories/');
            console.log('Categories response:', response);
            setCategories(Array.isArray(response.data) ? response.data : response.data?.results || []);
        } catch (error) {
            console.error('Error fetching categories:', error.response?.status, error.message);
            setCategories([]);
        }
    };

    const fetchPgns = async () => {
        try {
            console.log('Fetching PGNs from:', `/j1939/pgns/`);
            const response = await apiClient.get('/j1939/pgns/');
            console.log('PGNs response:', response);
            setPgns(Array.isArray(response.data) ? response.data : response.data?.results || []);
        } catch (error) {
            console.error('Error fetching PGNs:', error.response?.status, error.message);
            setPgns([]);
        }
    };

    const fetchSpns = async () => {
        try {
            console.log('Fetching SPNs from:', `/j1939/spns/`);
            const response = await apiClient.get('/j1939/spns/');
            console.log('SPNs response:', response);
            setSpns(Array.isArray(response.data) ? response.data : response.data?.results || []);
        } catch (error) {
            console.error('Error fetching SPNs:', error.response?.status, error.message);
            setSpns([]);
        }
    };

    // File handling functions
    const handleFileInputChange = (setForm) => (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError(`Invalid file type. Allowed types: ${Object.values(FILE_EXTENSIONS).join(', ')}`);
            e.target.value = '';
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size too large. Maximum size is 10MB.');
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

    const handleDownloadFile = (fileData) => {
        // In real application, this would be a download link
        alert(`Downloading: ${fileData.name}\nSize: ${fileData.size}\nType: ${FILE_EXTENSIONS[fileData.type] || fileData.type}`);
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
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
        // Map frontend field names to backend expectations per endpoint
        const keyMap = {};
        if (endpoint === '/j1939/standard-files/') {
            keyMap.file = 'File';
        } else if (endpoint === '/j1939/auxiliary-files/') {
            keyMap.file = 'File';
            keyMap.Title = 'File_Name';
        }

        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') return;
            const mappedKey = keyMap[key] || key;
            fd.append(mappedKey, value);
        });
        return fd;
    };

    const handleAddRecord = async (endpoint, form, resetForm, fetchData, successMessage) => {
        try {
            setError(null);
            const hasFile = !!form.file;
            const payload = hasFile ? buildFormData(form, endpoint) : form;
            const config = hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;

            const response = await apiClient.post(endpoint, payload, config);
            const data = response.data || response;
            
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
            showConfirmationPopup(successMessage);
        } catch (error) {
            console.error(`Error adding record:`, error);
            setError(`Error: ${error.message}`);
        }
    };

    const handleUpdateRecord = async (endpoint, form, recordId, resetForm, fetchData, successMessage) => {
        try {
            setError(null);
            const hasFile = !!form.file;
            const payload = hasFile ? buildFormData(form, endpoint) : form;
            const config = hasFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
            const method = hasFile ? 'put' : 'patch';

            const response = await apiClient[method](`${endpoint}${recordId}/`, payload, config);
            const data = response.data || response;
            
            const updatedData = { ...data, id: recordId };
            if (form.file) {
                updatedData.File = {
                    name: form.file.name,
                    type: form.file.type,
                    size: `${(form.file.size / 1024 / 1024).toFixed(1)} MB`,
                    uploaded_date: new Date().toISOString().split('T')[0]
                };
            }
            
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
            }
            
            resetForm();
            showConfirmationPopup(successMessage);
        } catch (error) {
            console.error(`Error updating record:`, error);
            setError(`Error: ${error.message}`);
        }
    };

    const handleDeleteRecord = async (endpoint, recordId, successMessage) => {
        setConfirmationAction(() => async () => {
            try {
                setError(null);
                await apiClient.delete(`${endpoint}${recordId}/`);
                
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
                
                showConfirmationPopup(successMessage);
            } catch (error) {
                console.error(`Error deleting record:`, error);
                setError(`Error: ${error.message}`);
            }
        });
        setShowConfirmation(true);
    };

    // Standard Files Management
    const handleAddStandardFile = async (e) => {
        e.preventDefault();

        // Frontend validation to avoid 400s
        if (!standardForm.file) {
            setError('Please select a file before submitting.');
            return;
        }
        if (!standardForm.Issued_Date) {
            setError('Issued Date is required.');
            return;
        }

        await handleAddRecord(
            '/j1939/standard-files/',
            standardForm,
            () => setStandardForm({
                Standard_No: '', Standard_Name: '', Issued_Date: '', Revised_Date: '', 
                Resource: '', file: null, Note: ''
            }),
            null,
            'Standard file added successfully!'
        );
        setShowStandardModal(false);
    };

    const handleUpdateStandardFile = async (e) => {
        e.preventDefault();
        await handleUpdateRecord(
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
        setShowStandardModal(false);
        setSelectedRecord(null);
    };

    // Auxiliary Files Management
    const handleAddAuxiliaryFile = async (e) => {
        e.preventDefault();
        await handleAddRecord(
            '/j1939/auxiliary-files/',
            auxiliaryForm,
            () => setAuxiliaryForm({
                Title: '', Description: '', Published_Date: '', Resource: '', 
                file: null, Linked_Standard: ''
            }),
            null,
            'Auxiliary file added successfully!'
        );
        setShowAuxiliaryModal(false);
    };

    // Category Management
    const handleAddCategory = async (e) => {
        e.preventDefault();
        await handleAddRecord(
            '/j1939/categories/',
            categoryForm,
            () => setCategoryForm({ Keyword_EN: '', Keyword_CH: '' }),
            null,
            'Category added successfully!'
        );
        setShowCategoryModal(false);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        await handleUpdateRecord(
            '/j1939/categories/',
            categoryForm,
            selectedRecord.id,
            () => setCategoryForm({ Keyword_EN: '', Keyword_CH: '' }),
            null,
            'Category updated successfully!'
        );
        setShowCategoryModal(false);
        setSelectedRecord(null);
    };

    // PGN Management
    const handleAddPgn = async (e) => {
        e.preventDefault();
        await handleAddRecord(
            '/j1939/pgns/',
            pgnForm,
            () => setPgnForm({
                PGN_Number: '', Name_Description: '', Category: '', Linked_Standard: ''
            }),
            null,
            'PGN added successfully!'
        );
        setShowPgnModal(false);
    };

    // SPN Management
    const handleAddSpn = async (e) => {
        e.preventDefault();
        await handleAddRecord(
            '/j1939/spns/',
            spnForm,
            () => setSpnForm({
                SPN_Number: '', Name_Description: '', Linked_PGN: '', Category: '', Linked_Auxiliary: ''
            }),
            null,
            'SPN added successfully!'
        );
        setShowSpnModal(false);
    };

    const showConfirmationPopup = (message) => {
        alert(message);
    };

    const filteredStandardFiles = standardFiles.filter(item => {
        return searchTerm === '' || 
            item.Standard_No?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Standard_Name?.toLowerCase().includes(searchTerm.toLowerCase());
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
                                        {filteredStandardFiles.map((file) => (
                                            <tr key={file.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {file.Standard_No}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {file.Standard_Name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {file.File ? (
                                                        <div className="flex items-center space-x-2">
                                                            {getFileIcon(file.File.type)}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {file.File.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {FILE_EXTENSIONS[file.File.type] || 'File'} • {file.File.size}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No file</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Issued_Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Revised_Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    {file.File && (
                                                        <button
                                                            onClick={() => handleViewFile(file.File)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View File
                                                        </button>
                                                    )}
                                                    {file.File && (
                                                        <button
                                                            onClick={() => handleDownloadFile(file.File)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecord(file);
                                                            setStandardForm({
                                                                Standard_No: file.Standard_No,
                                                                Standard_Name: file.Standard_Name,
                                                                Issued_Date: file.Issued_Date,
                                                                Revised_Date: file.Revised_Date,
                                                                Resource: file.Resource,
                                                                file: null,
                                                                Note: file.Note
                                                            });
                                                            setShowStandardModal(true);
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(
                                                            '/j1939/standard-files/',
                                                            file.id,
                                                            'Standard file deleted successfully!'
                                                        )}
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
                    </div>
                )}

                {/* Auxiliary Files Module */}
                {activeModule === 'auxiliary-files' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Auxiliary Files</h2>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setAuxiliaryForm({
                                        Title: '', Description: '', Published_Date: '', Resource: '', 
                                        file: null, Linked_Standard: ''
                                    });
                                    setShowAuxiliaryModal(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add New Auxiliary File
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
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
                                    {auxiliaryFiles.map((file) => (
                                        <tr key={file.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {file.Title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {file.File ? (
                                                    <div className="flex items-center space-x-2">
                                                        {getFileIcon(file.File.type)}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {file.File.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {FILE_EXTENSIONS[file.File.type] || 'File'} • {file.File.size}
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
                                                            📎 {standardFiles.find(std => std.id === file.Linked_Standard)?.Standard_No}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Not linked</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {file.Published_Date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {file.File && (
                                                    <button
                                                        onClick={() => handleViewFile(file.File)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View File
                                                    </button>
                                                )}
                                                {file.File && (
                                                    <button
                                                        onClick={() => handleDownloadFile(file.File)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Download
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(file);
                                                        setAuxiliaryForm({
                                                            Title: file.Title,
                                                            Description: file.Description,
                                                            Published_Date: file.Published_Date,
                                                            Resource: file.Resource,
                                                            file: null,
                                                            Linked_Standard: file.Linked_Standard || ''
                                                        });
                                                        setShowAuxiliaryModal(true);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(
                                                        '/j1939/auxiliary-files/',
                                                        file.id,
                                                        'Auxiliary file deleted successfully!'
                                                    )}
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
                                                {category.Keyword_EN}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {category.Keyword_CH}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(category);
                                                        setCategoryForm({
                                                            Keyword_EN: category.Keyword_EN,
                                                            Keyword_CH: category.Keyword_CH
                                                        });
                                                        setShowCategoryModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(
                                                        '/j1939/categories/',
                                                        category.id,
                                                        'Category deleted successfully!'
                                                    )}
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
                                                {pgn.PGN_Number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {pgn.Name_Description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {categories.find(cat => cat.id === pgn.Category)?.Keyword_EN}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button className="text-green-600 hover:text-green-900">Edit</button>
                                                <button 
                                                    onClick={() => handleDeleteRecord(
                                                        '/j1939/pgns/',
                                                        pgn.id,
                                                        'PGN deleted successfully!'
                                                    )}
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
                                                {spn.SPN_Number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {spn.Name_Description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pgns.find(pgn => pgn.id === spn.Linked_PGN)?.PGN_Number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {categories.find(cat => cat.id === spn.Category)?.Keyword_EN}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button className="text-green-600 hover:text-green-900">Edit</button>
                                                <button 
                                                    onClick={() => handleDeleteRecord(
                                                        '/j1939/spns/',
                                                        spn.id,
                                                        'SPN deleted successfully!'
                                                    )}
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
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedRecord ? 'Edit Standard File' : 'Add New Standard File'}
                        </h3>
                        <form onSubmit={selectedRecord ? handleUpdateStandardFile : handleAddStandardFile} className="space-y-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
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
                                        Upload File (PDF, XLSX, DOCX, ZIP, CSV) - Max 10MB
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            name="file"
                                            onChange={handleInputChange(standardForm, setStandardForm)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv"
                                            className="w-full px-3 py-2"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Allowed formats: PDF, XLS/XLSX, DOC/DOCX, ZIP, CSV
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
                                {selectedRecord ? 'Edit Auxiliary File' : 'Add New Auxiliary File'}
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

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateRecord(
                                '/j1939/auxiliary-files/',
                                auxiliaryForm,
                                selectedRecord?.id,
                                () => setAuxiliaryForm({
                                    Title: '', Description: '', Published_Date: '', Resource: '', 
                                    file: null, Linked_Standard: ''
                                }),
                                fetchAuxiliaryFiles,
                                'Auxiliary file ' + (selectedRecord ? 'updated' : 'added') + ' successfully!'
                            );
                            setShowAuxiliaryModal(false);
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="Title"
                                        value={auxiliaryForm.Title}
                                        onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Auxiliary file title"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Standard File</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            name="file"
                                            onChange={handleInputChange(auxiliaryForm, setAuxiliaryForm)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv"
                                            className="w-full px-3 py-2"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Allowed formats: PDF, XLS/XLSX, DOC/DOCX, ZIP, CSV - Max 10MB
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
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {selectedRecord ? 'Update Auxiliary File' : 'Add Auxiliary File'}
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
                                
                                {(previewFile.type.includes('spreadsheet') || previewFile.type.includes('excel')) && (
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
                                
                                {previewFile.type.includes('word') && (
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
                                
                                {(previewFile.type.includes('zip') || previewFile.type.includes('compressed')) && (
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
                                
                                {previewFile.type.includes('csv') && (
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

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    if (confirmationAction) {
                                        await confirmationAction();
                                    }
                                    setShowConfirmation(false);
                                    setConfirmationAction(null);
                                }}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setConfirmationAction(null);
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 