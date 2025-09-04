import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CallTracker = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showJoiningModal, setShowJoiningModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [followUpData, setFollowUpData] = useState([]);

    const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    candidateSays: '',
    status: '',
    nextDate: ''
  });
  const [joiningFormData, setJoiningFormData] = useState({
    nameAsPerAadhar: '',
    fatherName: '',
    dateOfJoining: '',
    joiningPlace: '',
    designation: '',
    salary: '',
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
    panCard: null,
    candidatePhoto: null,
    currentAddress: '',
    addressAsPerAadhar: '',
    dobAsPerAadhar: '',
    gender: '',
    mobileNo: '',
    familyMobileNo: '',
    relationshipWithFamily: '',
    pastPfId: '',
    currentBankAc: '',
    ifscCode: '',
    branchName: '',
    bankPassbookPhoto: null,
    personalEmail: '',
    esicNo: '',
    highestQualification: '',
    pfEligible: '',
    esicEligible: '',
    joiningCompanyName: '',
    emailToBeIssue: '',
    issueMobile: '',
    issueLaptop: '',
    aadharCardNo: '',
    modeOfAttendance: '',
    qualificationPhoto: null,
    paymentMode: '',
    salarySlip: null,
    resumeCopy: null
  });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [enquiryData, setEnquiryData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  const fetchEnquiryData = async () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);

    try {
      const [enquiryResponse, followUpResponse] = await Promise.all([
        fetch('https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=ENQUIRY&action=fetch'),
        fetch('https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=Follow - Up&action=fetch')
      ]);
      
      if (!enquiryResponse.ok || !followUpResponse.ok) {
        throw new Error(`HTTP error! status: ${enquiryResponse.status} or ${followUpResponse.status}`);
      }
      
      const [enquiryResult, followUpResult] = await Promise.all([
        enquiryResponse.json(),
        followUpResponse.json()
      ]);
      
      if (!enquiryResult.success || !enquiryResult.data || enquiryResult.data.length < 7) {
        throw new Error(enquiryResult.error || 'Not enough rows in enquiry sheet data');
      }
      
      // Process enquiry data
      const enquiryHeaders = enquiryResult.data[5].map(h => h.trim());
      const enquiryDataFromRow7 = enquiryResult.data.slice(6);
      
      const getIndex = (headerName) => enquiryHeaders.findIndex(h => h === headerName);
      
      const processedEnquiryData = enquiryDataFromRow7
        .filter(row => {
          const plannedIndex = getIndex('Planned');
          const actualIndex = getIndex('Actual');
          const planned = row[plannedIndex];
          const actual = row[actualIndex];
          return planned && (!actual || actual === '');
        })
        .map(row => ({
          id: row[getIndex('Timestamp')],
          indentNo: row[getIndex('Indent Number')],
          candidateEnquiryNo: row[getIndex('Candidate Enquiry Number')],
          applyingForPost: row[getIndex('Applying For the Post')],
          candidateName: row[getIndex('Candidate Name')],
          candidateDOB: row[getIndex('DOB')],
          candidatePhone: row[getIndex('Candidate Phone Number')],
          candidateEmail: row[getIndex('Candidate Email')],
          previousCompany: row[getIndex('Previous Company Name')],
          jobExperience: row[getIndex('Job Experience')] || '',
          lastSalary: row[getIndex('Last Salary Drawn')] || '',
          previousPosition: row[getIndex('Previous Position')] || '',
          reasonForLeaving: row[getIndex('Reason Of Leaving Previous Company')] || '',
          maritalStatus: row[getIndex('Marital Status')] || '',
          lastEmployerMobile: row[getIndex('Last Employer Mobile Number')] || '',
          candidatePhoto: row[getIndex('Candidate Photo')] || '',
          candidateResume: row[19] || '',
          referenceBy: row[getIndex('Reference By')] || '',
          presentAddress: row[getIndex('Present Address')] || '',
          aadharNo: row[getIndex('Aadhar Number')] || ''
        }));
      
      setEnquiryData(processedEnquiryData);
      
      // Process follow-up data for filtering
      if (followUpResult.success && followUpResult.data) {
        const rawFollowUpData = followUpResult.data || followUpResult;
        const followUpRows = Array.isArray(rawFollowUpData[0]) ? rawFollowUpData.slice(1) : rawFollowUpData;
        
        const processedFollowUpData = followUpRows.map(row => ({
          enquiryNo: row[1] || '',       // Column B (index 1) - Enquiry No
          status: row[2] || ''           // Column C (index 2) - Status
        }));
        
        setFollowUpData(processedFollowUpData);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

const fetchFollowUpData = async () => {
  setLoading(true);
  setTableLoading(true);
  setError(null);

  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec?sheet=Follow - Up&action=fetch'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Raw API response:', result);

    if (!result.success) {
      throw new Error(result.error || 'Google Script returned an error');
    }

    // Handle both array formats (direct data or result.data)
    const rawData = result.data || result;
    
    if (!Array.isArray(rawData)) {
      throw new Error('Expected array data not received');
    }

    // Process data - skip header row if present
    const dataRows = rawData.length > 0 && Array.isArray(rawData[0]) ? rawData.slice(1) : rawData;
    
    const processedData = dataRows.map(row => ({
      timestamp: row[0] || '',       // Column A (index 0) - Timestamp
      enquiryNo: row[1] || '',       // Column B (index 1) - Enquiry No
      status: row[2] || '',          // Column C (index 2) - Status
      candidateSays: row[3] || '',   // Column D (index 3) - Candidates Says
      nextDate: row[4] || ''         // Column E (index 4) - Next Date
    }));

    console.log('Processed follow-up data:', processedData);
    setHistoryData(processedData);
    
  } catch (error) {
    console.error('Error in fetchFollowUpData:', error);
    setError(error.message);
    toast.error(`Failed to load follow-ups: ${error.message}`);
  } finally {
    setLoading(false);
    setTableLoading(false);
  }
};

  useEffect(() => {
    fetchEnquiryData();
    fetchFollowUpData();
  }, []);

 const pendingData = enquiryData.filter(item => {
    const hasFinalStatus = followUpData.some(followUp => 
      followUp.enquiryNo === item.candidateEnquiryNo && 
      (followUp.status === 'Joining' || followUp.status === 'Reject')
    );
    return !hasFinalStatus;
  });

  const handleCallClick = (item) => {
    setSelectedItem(item);
    setFormData({
      candidateSays: '',
      status: '',
      nextDate: ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJoiningInputChange = (e) => {
    const { name, value } = e.target;
    setJoiningFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setJoiningFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const postToJoiningSheet = async (rowData) => {
  const URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec';

  try {
    console.log('Attempting to post:', {
      sheetName: 'JOINING',
      rowData: rowData
    });

    const params = new URLSearchParams();
    params.append('sheetName', 'JOINING');
    params.append('action', 'insert');
    params.append('rowData', JSON.stringify(rowData));

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Server response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Server returned unsuccessful response');
    }

    return data;
  } catch (error) {
    console.error('Full error details:', {
      error: error.message,
      stack: error.stack,
      rowData: rowData,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to update sheet: ${error.message}`);
  }
};


const postToSheet = async (rowData) => {
  const URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec';

  try {
    console.log('Attempting to post:', {
      sheetName: 'Follow - Up',
      rowData: rowData
    });

    const params = new URLSearchParams();
    params.append('sheetName', 'Follow - Up');
    params.append('action', 'insert');
    params.append('rowData', JSON.stringify(rowData));

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Server response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Server returned unsuccessful response');
    }

    return data;
  } catch (error) {
    console.error('Full error details:', {
      error: error.message,
      stack: error.stack,
      rowData: rowData,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Failed to update sheet: ${error.message}`);
  }
};

// utils/dateFormatter.js
 const formatDateTime=(isoString)=>{
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

 const uploadFileToDrive = async (file, folderId = '1Jk4XQKvq4QQRC7COAcajUReoX7zbQtW0') => {
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const params = new URLSearchParams();
      params.append('action', 'uploadFile');
      params.append('base64Data', base64Data);
      params.append('fileName', file.name);
      params.append('mimeType', file.type);
      params.append('folderId', folderId);

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'File upload failed');
      }

      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

const formatDOB = (dateString) => {
  if (!dateString) return '';
  
  // Handle different date formats that might come from the input
  let date;
  
  // If it's already a Date object
  if (dateString instanceof Date) {
    date = dateString;
  } 
  // If it's in the format "1/11/2021" (mm/dd/yyyy or dd/mm/yyyy)
  else if (typeof dateString === 'string' && dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      if (parseInt(parts[0]) > 12) {
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        date = new Date(parts[2], parts[0] - 1, parts[1]);
      }
    }
  } 
  else {
    date = new Date(dateString);
  }
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  if (!formData.candidateSays || !formData.status) {
    toast.error('Please fill all required fields');
    setSubmitting(false);
    return;
  }

  try {
    // For Joining status, just show the joining modal without submitting
    if (formData.status === 'Joining') {
      setShowModal(false);
      setShowJoiningModal(true);
    } else {
      // For other statuses, submit to Follow-Up sheet as before
      const now = new Date();
      const formattedTimestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const rowData = [
        formattedTimestamp,
        selectedItem.candidateEnquiryNo || '',
        formData.status,
        formData.candidateSays,
        formatDOB(formData.nextDate) || '',
      ];

      await postToSheet(rowData);
      toast.success('Update successful!');
      setShowModal(false);
      fetchEnquiryData();
    }
  } catch (error) {
    console.error('Submission failed:', error);
    toast.error(`Failed to update: ${error.message}`);
    if (error.message.includes('appendRow')) {
      toast('Please verify the "Follow-Up" sheet exists', {
        icon: 'ℹ️',
        duration: 8000
      });
    }
  } finally {
    setSubmitting(false);
  }
};

const handleJoiningSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    // First, submit the call tracker data to Follow-Up sheet
    const now = new Date();
    const formattedTimestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    const followUpRowData = [
      formattedTimestamp,
      selectedItem.candidateEnquiryNo || '',
      formData.status, // This should be "Joining"
      formData.candidateSays,
      formatDOB(formData.nextDate) || '',
    ];

    await postToSheet(followUpRowData);
    
    // Then proceed with the joining form submission
    // Upload files and get URLs
    const uploadPromises = {};
    const fileFields = [
      'aadharFrontPhoto',
      'bankPassbookPhoto',
      'resumeCopy'
    ];

    for (const field of fileFields) {
      if (joiningFormData[field]) {
        uploadPromises[field] = uploadFileToDrive(joiningFormData[field]);
      } else {
        uploadPromises[field] = Promise.resolve('');
      }
    }

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(
      Object.values(uploadPromises).map(promise => 
        promise.catch(error => {
          console.error('Upload failed:', error);
          return ''; // Return empty string if upload fails
        })
      )
    );

    // Map uploaded URLs to their respective fields
    const fileUrls = {};
    Object.keys(uploadPromises).forEach((field, index) => {
      fileUrls[field] = uploadedUrls[index];
    });

    const plannedDate = `${now.getDate()}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Create an array with all column values in order
    const rowData = [];
    
    // Assign values directly to array indices according to specified columns
    rowData[0] = formattedTimestamp;           // Column A: Timestamp
    rowData[1] = "";                           // Column B: (empty)
    rowData[2] = selectedItem.candidateName;   // Column C: Name As Per Aadhar
    rowData[3] = joiningFormData.fatherName;   // Column D: Father Name
    rowData[4] = formatDOB(joiningFormData.dateOfJoining); // Column E: Date Of Joining
    rowData[5] = joiningFormData.designation;  // Column F: Designation
    rowData[6] = fileUrls.aadharFrontPhoto;    // Column G: Aadhar card
    rowData[7] = "";                           // Column H: (empty)
    rowData[8] = selectedItem.presentAddress;  // Column I: Current Address
    rowData[9] = formatDOB(joiningFormData.dobAsPerAadhar); // Column J: Date Of Birth
    rowData[10] = joiningFormData.gender;      // Column K: Gender
    rowData[11] = selectedItem.candidatePhone; // Column L: Mobile No.
    rowData[12] = joiningFormData.familyMobileNo; // Column M: Family Mobile Number
    rowData[13] = joiningFormData.relationshipWithFamily; // Column N: Relationship With Family
    rowData[14] = joiningFormData.currentBankAc; // Column O: Current Account No
    rowData[15] = joiningFormData.ifscCode;    // Column P: IFSC Code
    rowData[16] = joiningFormData.branchName;  // Column Q: Branch Name
    rowData[17] = fileUrls.bankPassbookPhoto;  // Column R: Photo Of Front Bank Passbook
    rowData[18] = selectedItem.candidateEmail; // Column S: Candidate Email
    rowData[19] = joiningFormData.highestQualification; // Column T: Highest Qualification
    rowData[20] = joiningFormData.department;  // Column U: Department
    rowData[21] = joiningFormData.equipment;   // Column V: Equipment
    rowData[22] = selectedItem.aadharNo;       // Column W: Aadhar Number
    rowData[23] = fileUrls.resumeCopy;         // Column X: Upload Resume
    rowData[24] = "";                          // Column Y: (empty)
    rowData[25] = "";                          // Column Z: (empty)
    rowData[26] = plannedDate;                 // Column AA: Planned Date (timestamp)

    await postToJoiningSheet(rowData);

    console.log("Joining Form Data:", rowData);

    toast.success('Employee added successfully!');
    setShowJoiningModal(false);
    setSelectedItem(null);
    fetchEnquiryData();
  } catch (error) {
    console.error('Error submitting joining form:', error);
    toast.error(`Failed to submit joining form: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};

  const filteredPendingData = pendingData.filter(item => {
    const matchesSearch = item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.candidateEnquiryNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredHistoryData = historyData.filter(item => {
  const matchesSearch = item.enquiryNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     item.candidateSays?.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesSearch;
});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Call Tracker</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by candidate name or enquiry number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 opacity-60" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300 border-opacity-20">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} className="inline mr-2" />
              Pending ({filteredPendingData.length})
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <CheckCircle size={16} className="inline mr-2" />
              History ({filteredHistoryData.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indent No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Enquiry No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applying For Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                          <span className="text-gray-600 text-sm">Loading pending calls...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <p className="text-red-500">Error: {error}</p>
                        <button 
                          onClick={fetchEnquiryData}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filteredPendingData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No pending calls found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPendingData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCallClick(item)}
                            className="px-3 py-1 text-white bg-indigo-700 rounded-md hover:bg-opacity-90 text-sm"
                          >
                            Call
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.indentNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidateEnquiryNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.applyingForPost}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidateName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidatePhone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidateEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.candidatePhoto ? (
                            <a 
                              href={item.candidatePhoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              View
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {item.candidateResume ? (
    <a 
      href={item.candidateResume} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-indigo-600 hover:text-indigo-800"
    >
      View
    </a>
  ) : '-'}
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

         {activeTab === 'history' && (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry No</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Says</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {tableLoading ? (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center">
              <div className="flex justify-center flex-col items-center">
                <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
                <span className="text-gray-600 text-sm">Loading call history...</span>
              </div>
            </td>
          </tr>
        ) : filteredHistoryData.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center">
              <p className="text-gray-500">No call history found.</p>
            </td>
          </tr>
        ) : (
          filteredHistoryData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.enquiryNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'Joining' 
                    ? 'bg-green-100 text-green-800' 
                    : item.status === 'Reject'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.candidateSays}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nextDate || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.timestamp || '-'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}
        </div>
      </div>

      {/* Call Modal */}
{showModal && selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center p-6 border-b border-gray-300">
        <h3 className="text-lg font-medium text-gray-900">Call Tracker</h3>
        <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Enquiry No.</label>
          <input
            type="text"
            value={selectedItem.candidateEnquiryNo}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700"
          />
        </div> 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            required
          >
            <option value="">Select Status</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Interview">Interview</option>
            <option value="Negotiation">Negotiation</option>
            <option value="On Hold">On Hold</option>
            <option value="Joining">Joining</option>
            <option value="Reject">Reject</option>
          </select>
        </div>
        
        {/* Dynamic Label for Candidate Says Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.status === 'Negotiation' 
              ? "What's Customer Requirement *" 
              : formData.status === 'On Hold'
              ? "Reason For Holding the Candidate *"
              : formData.status === 'Joining'
              ? "When the candidate will join the company *"
              : formData.status === 'Reject'
              ? "Reason for Rejecting the Candidate *"
              : "What Did The Candidate Says *"}
          </label>
          <textarea
            name="candidateSays"
            value={formData.candidateSays}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            required
          />
        </div>
        
        {/* Dynamic Label for Next Date Field */}
        {formData.status && !['Joining', 'Reject'].includes(formData.status) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.status === 'Interview' 
                ? "Schedule Date *" 
                : formData.status === 'On Hold'
                ? "ReCalling Date *"
                : "Next Date *"}
            </label>
            <input
              type="date"
              name="nextDate"
              value={formData.nextDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
              required
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 min-h-[42px] flex items-center justify-center ${
              submitting ? 'opacity-90 cursor-not-allowed' : ''
            }`}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center">
                <svg 
                  className="animate-spin h-4 w-4 text-white mr-2" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </div>
            ) : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Joining Modal */}
      {showJoiningModal && selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b border-gray-300">
        <h3 className="text-lg font-medium text-gray-900">Employee Joining Form</h3>
        <button onClick={() => setShowJoiningModal(false)} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleJoiningSubmit} className="p-6 space-y-6">
        {/* Section 1: Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name As Per Aadhar *</label>
            <input
              type="text"
              disabled
              value={selectedItem.candidateName}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
            <input
              type="text"
              name="fatherName"
              value={joiningFormData.fatherName}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Birth *</label>
            <input
              type="date"
              name="dobAsPerAadhar"
              value={joiningFormData.dobAsPerAadhar}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={joiningFormData.gender}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              name="department"
              value={joiningFormData.department}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
              required
            >
              <option value="">Select Department</option>
              <option value="Dispatch">Dispatch</option>
              <option value="Office">Office</option>
              <option value="Sales">Sales</option>
              <option value="Admin">Admin</option>
              <option value="Sms">Sms</option>
              <option value="Store">Store</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <input
              type="text"
              name="equipment"
              value={joiningFormData.equipment}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No. *</label>
            <input
              type="tel"
              disabled
              value={selectedItem.candidatePhone}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Email *</label>
            <input
              type="email"
              disabled
              value={selectedItem.candidateEmail}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Mobile Number *</label>
            <input
              name="familyMobileNo"
              value={joiningFormData.familyMobileNo}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship With Family *</label>
            <input
              name="relationshipWithFamily"
              value={joiningFormData.relationshipWithFamily}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Section 3: Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
            <textarea
              disabled
              value={selectedItem.presentAddress}
              onChange={handleJoiningInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Section 4: Employment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Joining *</label>
            <input
              type="date"
              name="dateOfJoining"
              value={joiningFormData.dateOfJoining}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
            <input
              type="text"
              name="designation"
              value={joiningFormData.designation}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
            <input
              name="highestQualification"
              value={joiningFormData.highestQualification}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Section 5: Bank & Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number *</label>
            <input
              disabled
              value={selectedItem.aadharNo}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Account No*</label>
            <input
              name="currentBankAc"
              value={joiningFormData.currentBankAc}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code*</label>
            <input
              name="ifscCode"
              value={joiningFormData.ifscCode}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name*</label>
            <input
              name="branchName"
              value={joiningFormData.branchName}
              onChange={handleJoiningInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Section 6: Document Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'aadharFrontPhoto')}
                className="hidden"
                id="aadhar-front-upload"
              />
              <label
                htmlFor="aadhar-front-upload"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
              >
                <Upload size={16} className="mr-2" />
                Upload Photo
              </label>
              {joiningFormData.aadharFrontPhoto && (
                <span className="text-sm text-gray-700">{joiningFormData.aadharFrontPhoto.name}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Of Front Bank Passbook</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'bankPassbookPhoto')}
                className="hidden"
                id="bank-passbook-upload"
              />
              <label
                htmlFor="bank-passbook-upload"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
              >
                <Upload size={16} className="mr-2" />
                Upload Photo
              </label>
              {joiningFormData.bankPassbookPhoto && (
                <span className="text-sm text-gray-700">{joiningFormData.bankPassbookPhoto.name}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, 'resumeCopy')}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
              >
                <Upload size={16} className="mr-2" />
                Upload Resume
              </label>
              {joiningFormData.resumeCopy && (
                <span className="text-sm text-gray-700">{joiningFormData.resumeCopy.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => setShowJoiningModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 flex items-center justify-center min-h-[42px] ${
              submitting ? 'opacity-90 cursor-not-allowed' : ''
            }`}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default CallTracker;