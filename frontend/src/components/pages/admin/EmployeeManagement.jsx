'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';

// Mock API client since the real endpoints don't exist
const mockApiClient = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on endpoint
    switch (endpoint) {
      case '/j1939/standard-files/':
        return {
          data: [
            {
              id: 1,
              Standard_No: 'J1939-71 MAR2011',
              Standard_Name: 'Vehicle Application Layer',
              Issued_Date: '1994-08-01',
              Revised_Date: '2011-03-01',
              Resource: 'https://www.sae.org/standards/content/j1939-71_201103/',
              File: null,
              Note: 'Main vehicle application layer standard'
            },
            {
              id: 2,
              Standard_No: 'J1939-73 MAR2011',
              Standard_Name: 'Diagnostics',
              Issued_Date: '1996-02-01',
              Revised_Date: '2011-03-01',
              Resource: 'https://www.sae.org/standards/content/j1939-73_201103/',
              File: null,
              Note: 'Diagnostic data link layer'
            }
          ]
        };
      
      case '/j1939/auxiliary-files/':
        return {
          data: [
            {
              id: 1,
              Title: 'Engine Temperature Calculation Guide',
              Description: 'Detailed guide for engine temperature SPN calculations',
              Published_Date: '2023-01-15',
              Resource: '',
              File: null,
              Linked_Standard: 1
            },
            {
              id: 2,
              Title: 'Engine Speed Calculation Guide',
              Description: 'Guide for engine speed parameter calculations',
              Published_Date: '2023-02-20',
              Resource: '',
              File: null,
              Linked_Standard: 1
            }
          ]
        };
      
      case '/j1939/categories/':
        return {
          data: [
            { id: 1, Keyword_EN: 'Speed', Keyword_CH: '速度類' },
            { id: 2, Keyword_EN: 'Temperature', Keyword_CH: '溫度類' },
            { id: 3, Keyword_EN: 'Brake', Keyword_CH: '剎車類' },
            { id: 4, Keyword_EN: 'Oil', Keyword_CH: '油類' }
          ]
        };
      
      case '/j1939/pgns/':
        return {
          data: [
            {
              id: 1,
              PGN_Number: '1001',
              Name_Description: 'Engine Speed Message',
              Category: 1,
              Linked_Standard: 1
            },
            {
              id: 2,
              PGN_Number: '1002',
              Name_Description: 'Engine Temperature Message',
              Category: 2,
              Linked_Standard: 1
            }
          ]
        };
      
      case '/j1939/spns/':
        return {
          data: [
            {
              id: 1,
              SPN_Number: '110',
              Name_Description: 'Engine Temperature Sensor',
              Linked_PGN: 2,
              Category: 2,
              Linked_Auxiliary: 1
            },
            {
              id: 2,
              SPN_Number: '120',
              Name_Description: 'Engine Speed Sensor',
              Linked_PGN: 1,
              Category: 1,
              Linked_Auxiliary: 2
            }
          ]
        };
      
      default:
        throw new Error(`Endpoint ${endpoint} not found`);
    }
  },
  
  post: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('POST to', endpoint, 'with data:', data);
    return { data: { ...data, id: Date.now() } };
  },
  
  put: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('PUT to', endpoint, 'with data:', data);
    return { data };
  },
  
  delete: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('DELETE to', endpoint);
    return { data: { success: true } };
  }
};

export default function J1939ManagementSystem() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeModule, setActiveModule] = useState('standard-files');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Data states for SAE J1939 Management
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
        File: null,
        Note: ''
    });

    const [auxiliaryForm, setAuxiliaryForm] = useState({
        Title: '',
        Description: '',
        Published_Date: '',
        Resource: '',
        File: null,
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
        if (!user || user.role !== 'admin') {
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
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // API fetch functions with error handling
    const fetchStandardFiles = async () => {
        try {
            const response = await mockApiClient.get('/j1939/standard-files/');
            setStandardFiles(response.data);
        } catch (error) {
            console.error('Error fetching standard files:', error);
            throw error;
        }
    };

    const fetchAuxiliaryFiles = async () => {
        try {
            const response = await mockApiClient.get('/j1939/auxiliary-files/');
            setAuxiliaryFiles(response.data);
        } catch (error) {
            console.error('Error fetching auxiliary files:', error);
            throw error;
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await mockApiClient.get('/j1939/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    };

    const fetchPgns = async () => {
        try {
            const response = await mockApiClient.get('/j1939/pgns/');
            setPgns(response.data);
        } catch (error) {
            console.error('Error fetching PGNs:', error);
            throw error;
        }
    };

    const fetchSpns = async () => {
        try {
            const response = await mockApiClient.get('/j1939/spns/');
            setSpns(response.data);
        } catch (error) {
            console.error('Error fetching SPNs:', error);
            throw error;
        }
    };

    // Generic handlers
    const handleInputChange = (form, setForm) => (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setForm(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddRecord = async (endpoint, form, resetForm, fetchData, successMessage) => {
        try {
            setError(null);
            // For file uploads, you would normally use FormData
            // But for mock data, we'll just pass the object
            const response = await mockApiClient.post(endpoint, form);
            
            // Update local state
            if (fetchData) {
                await fetchData();
            } else {
                // For immediate UI update
                switch (endpoint) {
                    case '/j1939/standard-files/':
                        setStandardFiles(prev => [...prev, response.data]);
                        break;
                    case '/j1939/auxiliary-files/':
                        setAuxiliaryFiles(prev => [...prev, response.data]);
                        break;
                    case '/j1939/categories/':
                        setCategories(prev => [...prev, response.data]);
                        break;
                    case '/j1939/pgns/':
                        setPgns(prev => [...prev, response.data]);
                        break;
                    case '/j1939/spns/':
                        setSpns(prev => [...prev, response.data]);
                        break;
                }
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
            await mockApiClient.put(`${endpoint}${recordId}/`, form);
            
            if (fetchData) {
                await fetchData();
            } else {
                // Update local state
                const updatedData = { ...form, id: recordId };
                switch (endpoint) {
                    case '/j1939/standard-files/':
                        setStandardFiles(prev => prev.map(item => item.id === recordId ? updatedData : item));
                        break;
                    case '/j1939/categories/':
                        setCategories(prev => prev.map(item => item.id === recordId ? updatedData : item));
                        break;
                }
            }
            
            resetForm();
            showConfirmationPopup(successMessage);
        } catch (error) {
            console.error(`Error updating record:`, error);
            setError(`Error: ${error.message}`);
        }
    };

    const handleDeleteRecord = async (endpoint, recordId, fetchData, successMessage) => {
        setConfirmationAction(() => async () => {
            try {
                setError(null);
                await mockApiClient.delete(`${endpoint}${recordId}/`);
                
                if (fetchData) {
                    await fetchData();
                } else {
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
        await handleAddRecord(
            '/j1939/standard-files/',
            standardForm,
            () => setStandardForm({
                Standard_No: '', Standard_Name: '', Issued_Date: '', Revised_Date: '', 
                Resource: '', File: null, Note: ''
            }),
            fetchStandardFiles,
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
                Resource: '', File: null, Note: ''
            }),
            fetchStandardFiles,
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
                File: null, Linked_Standard: ''
            }),
            null, // Don't refetch, update local state directly
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
            null, // Don't refetch, update local state directly
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
            null, // Don't refetch, update local state directly
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
            null, // Don't refetch, update local state directly
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
            null, // Don't refetch, update local state directly
            'SPN added successfully!'
        );
        setShowSpnModal(false);
    };

    const showConfirmationPopup = (message) => {
        alert(message);
    };

    // Filter data based on search
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
                                        Resource: '', File: null, Note: ''
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Issued_Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.Revised_Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecord(file);
                                                            // Show detail view or modal
                                                            alert(`Standard File Details:\n\nNumber: ${file.Standard_No}\nName: ${file.Standard_Name}\nIssued: ${file.Issued_Date}\nRevised: ${file.Revised_Date}\nResource: ${file.Resource}\nNote: ${file.Note}`);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRecord(file);
                                                            setStandardForm({
                                                                Standard_No: file.Standard_No,
                                                                Standard_Name: file.Standard_Name,
                                                                Issued_Date: file.Issued_Date,
                                                                Revised_Date: file.Revised_Date,
                                                                Resource: file.Resource,
                                                                File: file.File,
                                                                Note: file.Note
                                                            });
                                                            setShowStandardModal(true);
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(
                                                            '/j1939/standard-files/',
                                                            file.id,
                                                            null,
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

                {/* Other modules remain the same as in the previous code */}
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
                                        File: null, Linked_Standard: ''
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {standardFiles.find(std => std.id === file.Linked_Standard)?.Standard_No || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {file.Published_Date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">View</button>
                                                <button className="text-green-600 hover:text-green-900">Edit</button>
                                                <button 
                                                    onClick={() => handleDeleteRecord(
                                                        '/j1939/auxiliary-files/',
                                                        file.id,
                                                        null,
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
                                                        null,
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
                                                        null,
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
                                                        null,
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

            {/* Modals remain the same as in the previous code */}
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
                                    <input
                                        type="date"
                                        name="Issued_Date"
                                        value={standardForm.Issued_Date}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Revised Date</label>
                                    <input
                                        type="date"
                                        name="Revised_Date"
                                        value={standardForm.Revised_Date}
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                    <input
                                        type="file"
                                        name="File"
                                        onChange={handleInputChange(standardForm, setStandardForm)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
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

            {/* Other modals (Auxiliary, Category, PGN, SPN) remain the same */}
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 text-green-600">Confirm Action</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to perform this action?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    if (confirmationAction) {
                                        await confirmationAction();
                                    }
                                    setShowConfirmation(false);
                                    setConfirmationAction(null);
                                }}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Confirm
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