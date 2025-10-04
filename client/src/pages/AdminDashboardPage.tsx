import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Package, FileText, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMachines: 0,
    openTickets: 0,
    kbEntries: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const [users, machines, tickets, kb] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/machines`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/tickets`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/kb`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      setStats({
        totalUsers: users.data.length,
        activeMachines: machines.data.length,
        openTickets: tickets.data.filter((t: any) => t.status === 'open').length,
        kbEntries: kb.data.length
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-dark-hover rounded-lg">
            <ArrowLeft className="w-5 h-5 text-dark-text" />
          </button>
          <h1 className="text-3xl font-bold text-dark-text">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-3xl font-bold text-dark-text">{stats.totalUsers}</div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <Package className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-3xl font-bold text-dark-text">{stats.activeMachines}</div>
                <div className="text-sm text-gray-400">Active Machines</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-3xl font-bold text-dark-text">{stats.openTickets}</div>
                <div className="text-sm text-gray-400">Open Tickets</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-2">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-3xl font-bold text-dark-text">{stats.kbEntries}</div>
                <div className="text-sm text-gray-400">KB Entries</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-dark-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/knowledge-review')}
                className="w-full text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors text-dark-text"
              >
                Review Pending Knowledge Entries
              </button>
              <button
                onClick={() => navigate('/admin/documents')}
                className="w-full text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors text-dark-text"
              >
                Manage Documents
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="w-full text-left px-4 py-3 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors text-dark-text"
              >
                View All Tickets
              </button>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-dark-text mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-sm text-gray-400">Database</span>
                <span className="text-sm text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-sm text-gray-400">API</span>
                <span className="text-sm text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                <span className="text-sm text-gray-400">Storage</span>
                <span className="text-sm text-green-400">75% Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
