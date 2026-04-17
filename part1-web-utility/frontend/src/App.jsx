import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">File Upload Portal</h1>
          <p className="mt-2 text-sm text-gray-600">Upload and manage your system logs, PDFs, CSVs, and ZIP files safely.</p>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className={`p-4 rounded-md ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Select File (.log, .pdf, .csv, .zip)</label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".log,.pdf,.csv,.zip"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Log Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Uploader Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="3"
                placeholder="Brief description of the file contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        </div>

        {/* File Dashboard */}
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">File Dashboard</h3>
            <button onClick={fetchFiles} className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              Refresh List
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No files uploaded yet.
                    </td>
                  </tr>
                ) : (
                  filesList.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]" title={f.originalName}>
                        {f.originalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {f.logDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {f.uploaderName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[250px]" title={f.description}>
                        {f.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Native anchor tag utilizing the backend's res.download() functionality */}
                        <a
                          href={`${API_BASE}/download/${f.savedName}`}
                          download
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Download
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
