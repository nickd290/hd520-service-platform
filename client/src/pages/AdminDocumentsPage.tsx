import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, Trash2, Edit2, Download } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  error_codes: string
  tags: string
  created_at: string
  updated_at: string
}

const AdminDocumentsPage = () => {
  const navigate = useNavigate()
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)

  useEffect(() => {
    loadKnowledge()
  }, [])

  const loadKnowledge = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/kb`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKnowledge(response.data)
    } catch (error) {
      console.error('Failed to load knowledge:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadStatus('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadStatus('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('document', selectedFile)

      const response = await axios.post(`${API_URL}/kb/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadStatus(`✅ Successfully uploaded: ${response.data.title}`)
      setSelectedFile(null)
      await loadKnowledge()
    } catch (error: any) {
      setUploadStatus(`❌ Upload failed: ${error.response?.data?.error || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/kb/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadKnowledge()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getErrorCodes = (errorCodesStr: string) => {
    try {
      return JSON.parse(errorCodesStr)
    } catch {
      return []
    }
  }

  const getTags = (tagsStr: string) => {
    try {
      return JSON.parse(tagsStr)
    } catch {
      return []
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-dark-text transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-dark-text mb-2">HD520 Knowledge Base Management</h1>
          <p className="text-gray-400">Upload HD520-specific manuals, procedures, and troubleshooting guides</p>
        </div>

        {/* Upload Section */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-8">
          <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-500" />
            Upload Document
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select HD520 Manual or Procedure Document
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-500 file:text-white
                  hover:file:bg-orange-600
                  cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supported: PDF (.pdf), Word (.doc, .docx), Text (.txt)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}

            {uploadStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                uploadStatus.startsWith('✅')
                  ? 'bg-green-500/10 text-green-400 border border-green-500'
                  : 'bg-red-500/10 text-red-400 border border-red-500'
              }`}>
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Entries */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
          <h2 className="text-xl font-bold text-dark-text mb-4">
            Knowledge Base ({knowledge.length} entries)
          </h2>

          <div className="space-y-4">
            {knowledge.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No knowledge entries yet. Upload HD520 documents to get started.
              </p>
            ) : (
              knowledge.map(entry => (
                <div
                  key={entry.id}
                  className="border border-dark-border rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-dark-text mb-1">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="capitalize">{entry.category}</span>
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                    {entry.content.substring(0, 200)}...
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {getErrorCodes(entry.error_codes).map((code: string) => (
                      <span
                        key={code}
                        className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500"
                      >
                        {code}
                      </span>
                    ))}
                    {getTags(entry.tags).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDocumentsPage
