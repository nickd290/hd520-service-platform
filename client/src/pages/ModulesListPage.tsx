import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { trainingApi } from '../services/api'
import { TrainingModule } from '../types'

const ModulesListPage = () => {
  const navigate = useNavigate()
  const { path } = useParams<{ path: 'operator' | 'technician' }>()
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (path) {
      loadModules()
    }
  }, [path])

  const loadModules = async () => {
    try {
      const response = await trainingApi.getModulesByPath(path as 'operator' | 'technician')
      setModules(response.data)
    } catch (error) {
      console.error('Failed to load modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="w-6 h-6 text-blue-400" />
      default:
        return <Circle className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500'
      case 'in_progress':
        return 'border-blue-500'
      default:
        return 'border-dark-border'
    }
  }

  const pathColor = path === 'operator' ? 'blue' : 'orange'
  const completedModules = modules.filter(m => m.user_status === 'completed').length
  const totalProgress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gray-400">Loading modules...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/training')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-text" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-dark-text capitalize">
                {path} Training Modules
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {completedModules} of {modules.length} modules completed
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-dark-text">Overall Progress</h3>
            <span className={`text-2xl font-bold text-primary-${pathColor}`}>
              {totalProgress}%
            </span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-3">
            <div
              className={`bg-primary-${pathColor} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div
              key={module.id}
              onClick={() => navigate(`/training/module/${module.id}`)}
              className={`bg-dark-card rounded-xl p-6 border ${getStatusColor(module.user_status)} hover:border-${pathColor}-500 transition-all cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(module.user_status)}
                </div>

                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-medium text-primary-${pathColor}`}>
                          Module {index + 1}
                        </span>
                        {module.quiz_passed && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Passed
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-dark-text group-hover:text-primary-blue transition-colors">
                        {module.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{module.duration_minutes} min</span>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4">{module.description}</p>

                  {module.progress_percentage !== undefined && module.progress_percentage > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Module Progress</span>
                        <span className="text-xs text-gray-500">{module.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-dark-bg rounded-full h-2">
                        <div
                          className={`bg-primary-${pathColor} h-2 rounded-full transition-all`}
                          style={{ width: `${module.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {module.quiz_score !== null && module.quiz_score !== undefined && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        Quiz Score: <span className={`font-medium ${module.quiz_passed ? 'text-green-400' : 'text-red-400'}`}>
                          {module.quiz_score}%
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate CTA */}
        {totalProgress === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-8 border border-green-500/30">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-dark-text mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-gray-400 mb-6">
                You've completed all modules. Generate your certificate now!
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/training/progress')
                }}
                className={`px-6 py-3 bg-primary-${pathColor} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
              >
                Get Your Certificate
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ModulesListPage
