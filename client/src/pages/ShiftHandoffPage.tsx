import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckSquare } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const ShiftHandoffPage = () => {
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [machineStatuses, setMachineStatuses] = useState<{[key: string]: boolean}>({})

  const checklistItems = [
    'Visual inspection for leaks',
    'Nozzle check completed',
    'Density check passed',
    'Ink levels adequate',
    'No error codes present',
    'Work area clean'
  ]

  const submitHandoff = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/shift-handoffs`,
        {
          notes,
          checklist: machineStatuses,
          shift_type: 'day'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Shift handoff submitted')
      setNotes('')
      setMachineStatuses({})
    } catch (error) {
      console.error('Failed to submit handoff:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-dark-hover rounded-lg">
            <ArrowLeft className="w-5 h-5 text-dark-text" />
          </button>
          <div className="flex items-center gap-2">
            <Clock className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-dark-text">Shift Handoff</h1>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-orange-500" />
            End-of-Shift Checklist
          </h2>

          <div className="space-y-3 mb-6">
            {checklistItems.map((item, index) => (
              <label key={index} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-hover">
                <input
                  type="checkbox"
                  checked={machineStatuses[item] || false}
                  onChange={(e) => setMachineStatuses({ ...machineStatuses, [item]: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="text-dark-text">{item}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes for Next Shift
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Document any issues, maintenance performed, or important information for the next shift..."
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-dark-text"
            />
          </div>
        </div>

        <button
          onClick={submitHandoff}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Submit Handoff
        </button>
      </div>
    </div>
  )
}

export default ShiftHandoffPage
