import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, Download, RefreshCw, FileBox, Eye, X, FileText, CheckCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [file, setFile] = useState(null);
  const [logDate, setLogDate] = useState('');
  const [description, setDescription] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [filesList, setFilesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Drag and Drop State
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      setFilesList(await response.json());
    } catch (error) {
      toast.error('Could not load the file dashboard.');
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validExtensions = ['.log', '.pdf', '.csv', '.zip'];
    const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      toast.error('Invalid file type. Only .log, .pdf, .csv, and .zip are allowed.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file to upload.');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('logDate', logDate);
    formData.append('description', description);
    formData.append('uploaderName', uploaderName);

    try {
      const response = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Upload failed');

      toast.success('File uploaded successfully!');
      setFile(null);
      setLogDate('');
      setDescription('');
      setUploaderName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFiles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Preview Handlers ---
  const handlePreview = async (f) => {
    setPreviewFile(f);
    const ext = f.originalName.substring(f.originalName.lastIndexOf('.')).toLowerCase();
    
    if (ext === '.csv' || ext === '.log') {
      setIsPreviewLoading(true);
      try {
        const res = await fetch(`${API_BASE}/preview/${f.savedName}`);
        if (!res.ok) throw new Error('Failed to load preview');
        setPreviewContent(await res.text());
      } catch (err) {
        setPreviewContent('Error loading file content.');
      } finally {
        setIsPreviewLoading(false);
      }
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">File Upload Portal</h1>
          <p className="text-base text-gray-500 max-w-xl">Securely upload, organize, and manage your system logs, PDFs, CSVs, and ZIP files.</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileBox className="w-5 h-5 mr-2 text-indigo-500" />
              New Upload
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Drag and Drop Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document (Max 5MB)</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="flex flex-col items-center justify-center text-indigo-600">
                        <CheckCircle className="mx-auto h-10 w-10 mb-2 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`mx-auto h-12 w-12 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">.LOG, .PDF, .CSV, .ZIP up to 5MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".log,.pdf,.csv,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Date</label>
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uploader Name</label>
                  <input type="text" placeholder="e.g. Jane Doe" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea rows="3" placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm placeholder-gray-400 resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}`}>
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><UploadCloud className="w-4 h-4 mr-2" /> Upload File</>}
              </button>
            </form>
          </div>
        </div>

        {/* File Dashboard */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">File Dashboard</h3>
            <button onClick={fetchFiles} className="flex items-center text-sm text-indigo-600 hover:bg-indigo-50 font-medium p-1.5 rounded-md transition-colors">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploader</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filesList.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500"><FileBox className="w-10 h-10 text-gray-300 mb-3 mx-auto" />No files uploaded yet.</td></tr>
                ) : (
                  filesList.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[250px]" title={f.originalName}>{f.originalName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.logDate ? new Date(f.logDate).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.uploaderName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                        <button onClick={() => handlePreview(f)} title="Preview file" className="inline-flex p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <a href={`${API_BASE}/download/${f.savedName}`} download title="Download file" className="inline-flex p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors">
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

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center truncate">
                <FileText className="w-5 h-5 mr-2 text-indigo-500 flex-shrink-0" />
                {previewFile.originalName}
              </h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              {previewFile.originalName.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={`${API_BASE}/preview/${previewFile.savedName}`} 
                  className="w-full h-[60vh] rounded-lg border border-gray-200 shadow-sm"
                  title="PDF Preview"
                />
              ) : previewFile.originalName.toLowerCase().endsWith('.zip') ? (
                <div className="flex flex-col items-center justify-center h-[40vh] text-gray-500">
                  <FileBox className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Preview not available for ZIP archives.</p>
                  <p className="text-sm">Please download the file to view its contents.</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 shadow-inner overflow-auto max-h-[60vh]">
                  {isPreviewLoading ? (
                    <div className="flex items-center justify-center h-40 text-indigo-400">
                      <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading content...
                    </div>
                  ) : (
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap word-break">
                      <code>{previewContent}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}