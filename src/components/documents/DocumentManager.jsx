import React, { useState, useEffect } from 'react';

const DocumentManager = ({ tenderId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [tenderId]);

  const loadDocuments = async () => {
    try {
      // Mock document data - in real app, fetch from API
      const mockDocs = [
        {
          id: '1',
          name: 'Tender_Document_Main.pdf',
          size: '2.5 MB',
          type: 'application/pdf',
          uploadedAt: '2024-08-10T10:30:00Z',
          status: 'processed',
          extractedInfo: {
            tenderValue: '₹15,00,000',
            deadline: '2024-09-15',
            eligibility: 'Class A contractors with 5+ years experience',
            keyRequirements: ['Technical specifications', 'Financial capacity', 'Past experience']
          },
          versions: [
            { version: '1.0', uploadedAt: '2024-08-10T10:30:00Z', changes: 'Initial upload' },
            { version: '1.1', uploadedAt: '2024-08-10T14:20:00Z', changes: 'Updated technical specifications' }
          ]
        },
        {
          id: '2',
          name: 'Technical_Specifications.pdf',
          size: '1.8 MB',
          type: 'application/pdf',
          uploadedAt: '2024-08-10T11:15:00Z',
          status: 'processing',
          extractedInfo: null,
          versions: [
            { version: '1.0', uploadedAt: '2024-08-10T11:15:00Z', changes: 'Initial upload' }
          ]
        },
        {
          id: '3',
          name: 'Financial_Criteria.pdf',
          size: '0.9 MB',
          type: 'application/pdf',
          uploadedAt: '2024-08-10T12:00:00Z',
          status: 'failed',
          error: 'Unable to extract text - document may be scanned',
          extractedInfo: null,
          versions: [
            { version: '1.0', uploadedAt: '2024-08-10T12:00:00Z', changes: 'Initial upload' }
          ]
        }
      ];
      setDocuments(mockDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        // Mock upload process
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          uploadedAt: new Date().toISOString(),
          status: 'uploading',
          extractedInfo: null,
          versions: [
            { version: '1.0', uploadedAt: new Date().toISOString(), changes: 'Initial upload' }
          ]
        };

        setDocuments(prev => [...prev, newDoc]);

        // Simulate upload and processing
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'processing' }
              : doc
          ));

          // Simulate processing completion
          setTimeout(() => {
            setDocuments(prev => prev.map(doc => 
              doc.id === newDoc.id 
                ? { 
                    ...doc, 
                    status: 'processed',
                    extractedInfo: {
                      tenderValue: '₹' + Math.floor(Math.random() * 10000000).toLocaleString(),
                      deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      eligibility: 'Standard eligibility criteria',
                      keyRequirements: ['Technical compliance', 'Financial capacity']
                    }
                  }
                : doc
            ));
          }, 3000);
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return '✅';
      case 'processing': return '⏳';
      case 'uploading': return '📤';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const handleDocumentClick = (doc) => {
    setSelectedDoc(doc);
    if (doc.extractedInfo) {
      setExtractedData(doc.extractedInfo);
    }
  };

  const reprocessDocument = async (docId) => {
    setProcessing(true);
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, status: 'processing', error: null }
        : doc
    ));

    // Simulate reprocessing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { 
              ...doc, 
              status: 'processed',
              extractedInfo: {
                tenderValue: '₹' + Math.floor(Math.random() * 10000000).toLocaleString(),
                deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                eligibility: 'Updated eligibility criteria after reprocessing',
                keyRequirements: ['Technical compliance', 'Financial capacity', 'Experience requirements']
              }
            }
          : doc
      ));
      setProcessing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Manager</h2>
            <p className="text-gray-600">Upload and manage tender documents with AI-powered extraction</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <span>Upload Documents</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Documents ({documents.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleDocumentClick(doc)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getStatusIcon(doc.status)}</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{doc.size}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        v{doc.versions[doc.versions.length - 1].version}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  
                  {doc.status === 'failed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reprocessDocument(doc.id);
                      }}
                      disabled={processing}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                      Retry
                    </button>
                  )}
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-lg">⋮</span>
                  </button>
                </div>
              </div>
              
              {doc.error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {doc.error}
                </div>
              )}
            </div>
          ))}
          
          {documents.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
              <p className="text-gray-600 mb-4">Upload PDF documents to get started with AI-powered extraction</p>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                <span>Upload Your First Document</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedDoc.name}</h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Document Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">{selectedDoc.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{selectedDoc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="text-gray-900">
                        {new Date(selectedDoc.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDoc.status)}`}>
                        {selectedDoc.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Version History</h4>
                  <div className="space-y-2">
                    {selectedDoc.versions.map((version, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">v{version.version}</span>
                          <span className="text-gray-600">
                            {new Date(version.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs">{version.changes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Extracted Information */}
              {selectedDoc.extractedInfo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tender Value:</span>
                        <p className="text-lg font-semibold text-green-600">{selectedDoc.extractedInfo.tenderValue}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Deadline:</span>
                        <p className="text-lg font-semibold text-red-600">{selectedDoc.extractedInfo.deadline}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Eligibility Criteria:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedDoc.extractedInfo.eligibility}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Key Requirements:</span>
                      <ul className="list-disc list-inside text-sm text-gray-900 mt-1 space-y-1">
                        {selectedDoc.extractedInfo.keyRequirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Download
                </button>
                <button className="px-4 py-2 text-blue-600 hover:text-blue-800">
                  Preview
                </button>
                {selectedDoc.status === 'failed' && (
                  <button
                    onClick={() => reprocessDocument(selectedDoc.id)}
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Reprocess
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;