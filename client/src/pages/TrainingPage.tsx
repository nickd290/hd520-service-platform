import { useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, BookOpen, Award } from 'lucide-react'

const TrainingPage = () => {
  const navigate = useNavigate()

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
              <h1 className="text-2xl font-bold text-dark-text">Training Mode</h1>
            </div>
            <button
              onClick={() => navigate('/training/progress')}
              className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
            >
              <Award className="w-5 h-5 text-primary-blue" />
              <span className="text-dark-text">My Progress</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-text mb-4">Choose Your Training Path</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select the training program that matches your role and skill level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Operator Training */}
          <div
            onClick={() => navigate('/training/operator')}
            className="bg-dark-card rounded-xl p-8 border border-dark-border hover:border-blue-500 transition-all cursor-pointer group transform hover:scale-105 duration-300"
          >
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Operator Training</h2>
            <p className="text-gray-400 mb-6">
              Learn essential HD520 operations, safety protocols, and daily maintenance procedures.
            </p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Machine startup and shutdown
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Safety and PPE requirements
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Routine maintenance tasks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Basic troubleshooting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Certification exam
              </li>
            </ul>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">5 Modules</span>
              <span className="text-blue-400 font-medium">~3 hours total</span>
            </div>
          </div>

          {/* Technician Training */}
          <div
            onClick={() => navigate('/training/technician')}
            className="bg-dark-card rounded-xl p-8 border border-dark-border hover:border-orange-500 transition-all cursor-pointer group transform hover:scale-105 duration-300"
          >
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Technician Training</h2>
            <p className="text-gray-400 mb-6">
              Master advanced diagnostics, component repair, and precision calibration techniques.
            </p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Advanced system diagnostics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Print head replacement
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Ink system maintenance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Precision calibration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                Electronic system repair
              </li>
            </ul>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">5 Modules</span>
              <span className="text-orange-400 font-medium">~5 hours total</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-dark-card rounded-xl p-8 border border-dark-border max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-dark-text mb-6">How Training Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">1</div>
              <h4 className="font-bold text-dark-text mb-2">Complete Modules</h4>
              <p className="text-gray-400 text-sm">
                Work through interactive training modules with videos, text, and practical examples
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
              <h4 className="font-bold text-dark-text mb-2">Pass Quizzes</h4>
              <p className="text-gray-400 text-sm">
                Test your knowledge with quizzes at the end of each module (70% to pass)
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
              <h4 className="font-bold text-dark-text mb-2">Earn Certificate</h4>
              <p className="text-gray-400 text-sm">
                Complete all modules to receive your official HD520 certification
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TrainingPage
