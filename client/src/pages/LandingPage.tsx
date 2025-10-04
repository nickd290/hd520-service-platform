import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Wrench, LineChart, LogOut } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const cards = [
    {
      title: 'Training Mode',
      description: 'Comprehensive training for operators and technicians. Learn machine operations, safety protocols, and advanced diagnostics.',
      icon: GraduationCap,
      color: 'from-blue-600 to-blue-800',
      textColor: 'text-blue-400',
      route: '/training'
    },
    {
      title: 'Maintenance Mode',
      description: 'AI-powered troubleshooting assistant with photo diagnosis, error code lookup, and service ticket management.',
      icon: Wrench,
      color: 'from-orange-600 to-orange-800',
      textColor: 'text-orange-400',
      route: '/maintenance'
    },
    {
      title: 'Trust Data Dashboard',
      description: 'Real-time production metrics, analytics, and predictive maintenance insights for optimal machine performance.',
      icon: LineChart,
      color: 'from-green-600 to-green-800',
      textColor: 'text-green-400',
      route: '/trust-data'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-dark-text">HD520 Service Platform</h1>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-dark-text font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border text-dark-text rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-text mb-4">
            Your Complete Service & Training Platform
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to maintain, troubleshoot, and optimize your HD520 machines
          </p>
        </div>

        {/* Three Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className="bg-dark-card rounded-xl p-8 border border-dark-border hover:border-gray-600 transition-all cursor-pointer group hover:scale-105 transform duration-300"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${card.textColor}`}>
                  {card.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-blue mb-2">AI-Powered</div>
            <p className="text-gray-400">Claude API integration for intelligent troubleshooting</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-orange mb-2">Role-Based</div>
            <p className="text-gray-400">Customized experience for customers, technicians, and admins</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-green mb-2">Real-Time</div>
            <p className="text-gray-400">Live production metrics and performance tracking</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">Knowledge Base</div>
            <p className="text-gray-400">Self-updating from resolved technical issues</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 HD520 Service Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
