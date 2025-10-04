import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

interface PendingEntry {
  id: string
  title: string
  content: string
  category: string
  error_codes: string
  tags: string
  issue_description: string
  solution_steps: string
  parts_used: string
  time_to_resolve: number
  machine_serial: string
  submitted_by: string
  user_role: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const AdminKnowledgeReviewPage = () => {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<PendingEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedEntry, setSelectedEntry] = useState<PendingEntry | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedCategory, setEditedCategory] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadEntries()
  }, [filter])

  const loadEntries = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = filter === 'all'
        ? `${API_URL}/pending-kb`
        : `${API_URL}/pending-kb?status=${filter}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEntries(response.data)
    } catch (error) {
      console.error('Failed to load entries:', error)
    }
  }

  const viewEntry = (entry: PendingEntry) => {
    setSelectedEntry(entry)
    setEditedTitle(entry.title)
    setEditedContent(entry.content)
    setEditedCategory(entry.category)
    setReviewNotes('')
  }

  const approveEntry = async () => {
    if (!selectedEntry) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/pending-kb/${selectedEntry.id}/approve`,
        {
          review_notes: reviewNotes,
          edited_title: editedTitle,
          edited_content: editedContent,
          edited_category: editedCategory
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSelectedEntry(null)
      await loadEntries()
    } catch (error) {
      console.error('Failed to approve entry:', error)
    }
  }

  const rejectEntry = async () => {
    if (!selectedEntry) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/pending-kb/${selectedEntry.id}/reject`,
        { review_notes: reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSelectedEntry(null)
      await loadEntries()
    } catch (error) {
      console.error('Failed to reject entry:', error)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/pending-kb/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadEntries()
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-dark-text transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <h1 className="text-3xl font-bold text-dark-text mb-2">Knowledge Base Review Queue</h1>
        <p className="text-gray-400 mb-6">Review and approve solutions submitted by technicians</p>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              {f} ({entries.filter(e => f === 'all' || e.status === f).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entries List */}
          <div className="space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => viewEntry(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-dark-text">{entry.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      entry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      entry.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p className="capitalize">Category: {entry.category}</p>
                  <p>Submitted by: {entry.user_role}</p>
                  <p>{new Date(entry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No entries to review
              </div>
            )}
          </div>

          {/* Entry Details */}
          {selectedEntry && (
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-dark-text mb-4">Review Entry</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text"
                  >
                    <option value="general">General</option>
                    <option value="ink-system">Ink System</option>
                    <option value="printhead">Printhead</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="safety">Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about your review decision..."
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text"
                  />
                </div>
              </div>

              {selectedEntry.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={approveEntry}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={rejectEntry}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}

              {selectedEntry.status !== 'pending' && (
                <button
                  onClick={() => deleteEntry(selectedEntry.id)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Entry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminKnowledgeReviewPage
