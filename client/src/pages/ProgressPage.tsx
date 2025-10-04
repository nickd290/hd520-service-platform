import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Award, Download, CheckCircle, Clock } from 'lucide-react'
import { trainingApi } from '../services/api'
import { ProgressSummary, Certificate } from '../types'

const ProgressPage = () => {
  const navigate = useNavigate()
  const [operatorProgress, setOperatorProgress] = useState<ProgressSummary | null>(null)
  const [technicianProgress, setTechnicianProgress] = useState<ProgressSummary | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingCert, setGeneratingCert] = useState<string | null>(null)

  useEffect(() => {
    loadProgress()
    loadCertificates()
  }, [])

  const loadProgress = async () => {
    try {
      const [opResponse, techResponse] = await Promise.all([
        trainingApi.getProgressSummary('operator').catch(() => null),
        trainingApi.getProgressSummary('technician').catch(() => null)
      ])

      if (opResponse) setOperatorProgress(opResponse.data)
      if (techResponse) setTechnicianProgress(techResponse.data)
    } catch (error) {
      console.error('Failed to load progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      const response = await trainingApi.getCertificates()
      setCertificates(response.data)
    } catch (error) {
      console.error('Failed to load certificates:', error)
    }
  }

  const handleGenerateCertificate = async (path: 'operator' | 'technician') => {
    setGeneratingCert(path)
    try {
      await trainingApi.generateCertificate(path)
      await loadCertificates()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate certificate')
    } finally {
      setGeneratingCert(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gray-400">Loading progress...</div>
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
            <h1 className="text-2xl font-bold text-dark-text">My Training Progress</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Operator Progress */}
          {operatorProgress && (
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-blue-400">Operator Training</h2>
                <span className="text-3xl font-bold text-blue-400">
                  {operatorProgress.overallProgress}%
                </span>
              </div>

              <div className="w-full bg-dark-bg rounded-full h-3 mb-6">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${operatorProgress.overallProgress}%` }}
                ></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Modules Completed</span>
                  <span className="text-dark-text font-medium">
                    {operatorProgress.completedModules} / {operatorProgress.totalModules}
                  </span>
                </div>
              </div>

              {operatorProgress.overallProgress === 100 ? (
                <button
                  onClick={() => handleGenerateCertificate('operator')}
                  disabled={generatingCert === 'operator'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  {generatingCert === 'operator' ? 'Generating...' : 'Get Certificate'}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/training/operator')}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue Learning
                </button>
              )}
            </div>
          )}

          {/* Technician Progress */}
          {technicianProgress && (
            <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-orange-400">Technician Training</h2>
                <span className="text-3xl font-bold text-orange-400">
                  {technicianProgress.overallProgress}%
                </span>
              </div>

              <div className="w-full bg-dark-bg rounded-full h-3 mb-6">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${technicianProgress.overallProgress}%` }}
                ></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Modules Completed</span>
                  <span className="text-dark-text font-medium">
                    {technicianProgress.completedModules} / {technicianProgress.totalModules}
                  </span>
                </div>
              </div>

              {technicianProgress.overallProgress === 100 ? (
                <button
                  onClick={() => handleGenerateCertificate('technician')}
                  disabled={generatingCert === 'technician'}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  {generatingCert === 'technician' ? 'Generating...' : 'Get Certificate'}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/training/technician')}
                  className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Continue Learning
                </button>
              )}
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold text-dark-text">My Certificates</h2>
            </div>

            <div className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-6 border border-yellow-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-bold text-dark-text capitalize">
                          {cert.training_path} Certification
                        </h3>
                      </div>
                      <p className="text-gray-400 mb-2">
                        Certificate Number: <span className="text-yellow-400 font-mono">{cert.certificate_number}</span>
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Issued: {formatDate(cert.issued_at)}</span>
                        </div>
                        <span>•</span>
                        <span>Expires: {formatDate(cert.expires_at)}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Details */}
        {(operatorProgress || technicianProgress) && (
          <div className="mt-12 space-y-8">
            {operatorProgress && operatorProgress.modules.length > 0 && (
              <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
                <h3 className="text-xl font-bold text-blue-400 mb-6">Operator Modules</h3>
                <div className="space-y-3">
                  {operatorProgress.modules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {module.user_status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-500" />
                        )}
                        <div>
                          <h4 className="text-dark-text font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-500">{module.duration_minutes} minutes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {module.quiz_score !== null && module.quiz_score !== undefined && (
                          <p className={`text-sm font-medium ${module.quiz_passed ? 'text-green-400' : 'text-red-400'}`}>
                            Score: {module.quiz_score}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {technicianProgress && technicianProgress.modules.length > 0 && (
              <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
                <h3 className="text-xl font-bold text-orange-400 mb-6">Technician Modules</h3>
                <div className="space-y-3">
                  {technicianProgress.modules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {module.user_status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-500" />
                        )}
                        <div>
                          <h4 className="text-dark-text font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-500">{module.duration_minutes} minutes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {module.quiz_score !== null && module.quiz_score !== undefined && (
                          <p className={`text-sm font-medium ${module.quiz_passed ? 'text-green-400' : 'text-red-400'}`}>
                            Score: {module.quiz_score}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ProgressPage
