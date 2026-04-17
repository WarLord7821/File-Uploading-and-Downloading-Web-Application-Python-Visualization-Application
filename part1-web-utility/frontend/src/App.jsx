import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  FileBox 
} from 'lucide-react';

export default function App() {
  // --- State Hooks ---
  const [file, setFile] = useState(null);
  const [logDate, setLogDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  
  const [filesList, setFilesList] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- API Base URL ---
  const API_BASE = 'http://localhost:3000';

  // --- Effects ---
  useEffect(() => {
    fetchFiles();
  }, []);

  // --- Functions ---
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFilesList(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setStatus({ type: 'error', message: 'Could not load the file dashboard.' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Construct FormData for multipart/form-data payload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('logDate', logDate);
    formData.append('description', description);
    formData.append('uploaderName', uploaderName);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setStatus({ type: 'success', message: 'File uploaded successfully!' });
      
      // Reset form fields
      setFile(null);
      setLogDate('');
      setDescription('');
      setUploaderName('');
      e.target.reset(); // Resets the file input visually

      // Refresh the dashboard
      fetchFiles();

    } catch (error) {
      console.error("Upload error:", error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Area */}
        <div className="text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">File Upload Portal</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Securely upload, organize, and manage your system logs, PDFs, CSVs, and ZIP files.
          </p>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className={`p-4 rounded-lg flex items-center shadow-sm ${
            status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {status.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        {/* Upload Form Card */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileBox className="w-5 h-5 mr-2 text-indigo-500" />
              New Upload
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File (.log, .pdf, .csv, .zip)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".log,.pdf,.csv,.zip"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 
                      file:mr-4 file:py-2.5 file:px-4 
                      file:rounded-md file:border-0 
                      file:text-sm file:font-medium 
                      file:bg-indigo-50 file:text-indigo-700 
                      hover:file:bg-indigo-100 hover:file:cursor-pointer
                      border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Two Column Grid for Date and Name */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uploader Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of the file contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm placeholder-gray-400 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* File Dashboard */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
          {/* Dashboard Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">File Dashboard</h3>
            <button 
              onClick={fetchFiles} 
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors p-1.5 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploader</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Download</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileBox className="w-10 h-10 text-gray-300 mb-3" />
                        <p>No files have been uploaded yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filesList.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]" title={f.originalName}>
                        {f.originalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {f.logDate ? new Date(f.logDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {f.uploaderName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[250px]" title={f.description}>
                        {f.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <a
                          href={`${API_BASE}/download/${f.savedName}`}
                          download
                          title="Download file"
                          className="inline-flex items-center justify-center p-2 rounded-full text-indigo-600 hover:bg-indigo-100 hover:text-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}