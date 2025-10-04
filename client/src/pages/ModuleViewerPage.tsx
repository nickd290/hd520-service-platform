import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, CheckSquare, Award } from 'lucide-react'
import { trainingApi } from '../services/api'
import { ModuleWithContent, QuizQuestion } from '../types'

const ModuleViewerPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [module, setModule] = useState<ModuleWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [quizResult, setQuizResult] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadModule()
    }
  }, [id])

  const loadModule = async () => {
    try {
      const response = await trainingApi.getModuleById(id!)
      setModule(response.data)
      setQuizAnswers(new Array(response.data.quiz.length).fill(''))

      // Start from last viewed section or beginning
      if (response.data.last_section_viewed) {
        setCurrentSection(response.data.last_section_viewed)
      }
    } catch (error) {
      console.error('Failed to load module:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async () => {
    if (!module || !id) return

    const progressPercentage = showQuiz
      ? 100
      : Math.round(((currentSection + 1) / module.content.length) * 100)

    try {
      await trainingApi.updateProgress(id, {
        status: showQuiz ? 'in_progress' : progressPercentage === 100 ? 'in_progress' : 'in_progress',
        progress_percentage: progressPercentage,
        last_section_viewed: currentSection
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleNextSection = () => {
    if (!module) return

    if (currentSection < module.content.length - 1) {
      setCurrentSection(currentSection + 1)
      updateProgress()
    } else {
      setShowQuiz(true)
      updateProgress()
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answer
    setQuizAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    if (!id) return

    try {
      const response = await trainingApi.submitQuiz(id, quizAnswers)
      setQuizResult(response.data)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gray-400">Loading module...</div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gray-400">Module not found</div>
      </div>
    )
  }

  const pathColor = module.training_path === 'operator' ? 'blue' : 'orange'

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/training/${module.training_path}`)}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-text" />
            </button>
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-dark-text">{module.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {showQuiz ? 'Quiz' : `Section ${currentSection + 1} of ${module.content.length}`}
              </p>
            </div>
            <div className={`px-4 py-2 bg-primary-${pathColor}/20 text-primary-${pathColor} rounded-lg text-sm font-medium`}>
              {module.duration_minutes} minutes
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-dark-card rounded-full h-2">
            <div
              className={`bg-primary-${pathColor} h-2 rounded-full transition-all duration-300`}
              style={{
                width: `${showQuiz ? 100 : Math.round(((currentSection + 1) / module.content.length) * 100)}%`
              }}
            ></div>
          </div>
        </div>

        {!showQuiz ? (
          /* Content Section */
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <h2 className={`text-2xl font-bold text-primary-${pathColor} mb-6`}>
              {module.content[currentSection]?.section_title}
            </h2>

            {module.content[currentSection]?.section_type === 'video' && module.content[currentSection]?.video_url ? (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(module.content[currentSection].video_url!)}
                    title="Training Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : module.content[currentSection]?.section_type === 'video' && module.video_url ? (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(module.video_url)}
                    title="Training Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : null}

            <div className="prose prose-invert max-w-none">
              {module.content[currentSection]?.section_type === 'checklist' ? (
                <ul className="space-y-3">
                  {module.content[currentSection]?.section_content.split('\n').filter(Boolean).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-primary-blue mt-1 flex-shrink-0" />
                      <span className="text-gray-300">{item.replace(/^[•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {module.content[currentSection]?.section_content}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-border">
              <button
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
                className="px-6 py-2 border border-dark-border rounded-lg text-dark-text hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="text-sm text-gray-500">
                {currentSection + 1} / {module.content.length}
              </div>
              <button
                onClick={handleNextSection}
                className={`px-6 py-2 bg-primary-${pathColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                {currentSection === module.content.length - 1 ? 'Take Quiz' : 'Next'}
              </button>
            </div>
          </div>
        ) : !quizResult ? (
          /* Quiz Section */
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              <Award className={`w-8 h-8 text-primary-${pathColor}`} />
              <h2 className="text-2xl font-bold text-dark-text">Knowledge Check</h2>
            </div>
            <p className="text-gray-400 mb-8">
              Answer all questions to complete this module. You need 70% or higher to pass.
            </p>

            <div className="space-y-8">
              {module.quiz.map((question, qIdx) => (
                <div key={question.id} className="border border-dark-border rounded-lg p-6">
                  <p className="text-lg font-medium text-dark-text mb-4">
                    {qIdx + 1}. {question.question_text}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option, oIdx) => (
                      <label
                        key={oIdx}
                        className="flex items-center gap-3 p-3 rounded-lg border border-dark-border hover:bg-dark-hover cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          value={option.text}
                          checked={quizAnswers[qIdx] === option.text}
                          onChange={() => handleQuizAnswer(qIdx, option.text)}
                          className="w-4 h-4 text-primary-blue"
                        />
                        <span className="text-gray-300">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmitQuiz}
                disabled={quizAnswers.some(a => !a)}
                className={`px-8 py-3 bg-primary-${pathColor} text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Submit Quiz
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Results */
          <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
            <div className="text-center">
              <div className={`inline-block p-6 rounded-full ${quizResult.passed ? 'bg-green-500/20' : 'bg-red-500/20'} mb-6`}>
                {quizResult.passed ? (
                  <Award className="w-16 h-16 text-green-400" />
                ) : (
                  <Play className="w-16 h-16 text-red-400" />
                )}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${quizResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                {quizResult.passed ? 'Congratulations!' : 'Keep Learning'}
              </h2>
              <p className="text-gray-400 mb-6">{quizResult.message}</p>
              <div className="text-5xl font-bold text-dark-text mb-8">
                {quizResult.percentage}%
              </div>
              <p className="text-gray-400 mb-8">
                You scored {quizResult.score} out of {quizResult.totalQuestions} questions correctly
              </p>
              <div className="flex gap-4 justify-center">
                {!quizResult.passed && (
                  <button
                    onClick={() => {
                      setShowQuiz(false)
                      setCurrentSection(0)
                      setQuizResult(null)
                      setQuizAnswers(new Array(module.quiz.length).fill(''))
                    }}
                    className="px-6 py-3 border border-dark-border text-dark-text rounded-lg hover:bg-dark-hover transition-colors"
                  >
                    Review Material
                  </button>
                )}
                {!quizResult.passed && (
                  <button
                    onClick={() => {
                      setQuizResult(null)
                      setQuizAnswers(new Array(module.quiz.length).fill(''))
                    }}
                    className={`px-6 py-3 bg-primary-${pathColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Retake Quiz
                  </button>
                )}
                {quizResult.passed && (
                  <button
                    onClick={() => navigate(`/training/${module.training_path}`)}
                    className={`px-6 py-3 bg-primary-${pathColor} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Continue Training
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ModuleViewerPage
