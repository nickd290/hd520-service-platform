import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Droplet, Target, Gauge, Download, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

interface Machine {
  id: string
  serial_number: string
  model: string
}

const TrustDataPage = () => {
  const navigate = useNavigate()
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachine, setSelectedMachine] = useState<string>('')
  const [metrics, setMetrics] = useState({
    colorDensity: 98.5,
    inkVolume: 2.4,
    calibration: 0.02,
    printCycles: 145000
  })

  useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMachines(response.data)
      if (response.data.length > 0) {
        setSelectedMachine(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load machines:', error)
    }
  }

  const exportPDF = () => {
    alert('PDF export coming soon')
  }

  const exportCSV = () => {
    alert('CSV export coming soon')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-dark-text" />
              </button>
              <h1 className="text-2xl font-bold text-dark-text">Trust Data Dashboard</h1>
            </div>
            <div>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-dark-text"
              >
                <option value="">Select Machine</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.serial_number} - {m.model}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-500">REAL-TIME</span>
            </div>
            <div className="text-3xl font-bold text-dark-text mb-1">98.5%</div>
            <div className="text-sm text-gray-400">Color Density Accuracy</div>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <Droplet className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-500">REAL-TIME</span>
            </div>
            <div className="text-3xl font-bold text-dark-text mb-1">2.4L</div>
            <div className="text-sm text-gray-400">Ink Volume Remaining</div>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-gray-500">REAL-TIME</span>
            </div>
            <div className="text-3xl font-bold text-dark-text mb-1">±0.02mm</div>
            <div className="text-sm text-gray-400">Calibration Precision</div>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-gray-500">REAL-TIME</span>
            </div>
            <div className="text-3xl font-bold text-dark-text mb-1">145k</div>
            <div className="text-sm text-gray-400">Print Cycles Today</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-lg font-bold text-dark-text mb-4">Performance Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization will be implemented here
            </div>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-lg font-bold text-dark-text mb-4">Maintenance Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-500">Calibration Due</span>
                </div>
                <p className="text-xs text-gray-400">Scheduled calibration in 2 days</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-500">Ink Refill Soon</span>
                </div>
                <p className="text-xs text-gray-400">Current level at 45%</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-500">System Optimal</span>
                </div>
                <p className="text-xs text-gray-400">All systems operating normally</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 bg-dark-card rounded-xl p-6 border border-dark-border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-dark-text mb-2">Export Reports</h3>
              <p className="text-sm text-gray-400">Download production and maintenance data</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TrustDataPage
