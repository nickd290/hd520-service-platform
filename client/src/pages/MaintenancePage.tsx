import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Plus, Loader2, Trash2, Camera, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  photo_url?: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  machine_serial?: string
  created_at: string
  updated_at: string
  message_count?: number
  last_message?: string
}

const MaintenancePage = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserName(`${user.first_name} ${user.last_name}`)
      setUserRole(user.role)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Load conversation messages
  const loadMessages = async (conversationId: string) => {
    // Abort any ongoing stream when switching conversations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/chat/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data.messages)
      setCurrentConversation(conversationId)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // Create new conversation
  const createNewConversation = async () => {
    // Abort any ongoing stream when creating new conversation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/chat/conversation`,
        { machine_serial: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await loadConversations()
      await loadMessages(response.data.id)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  // Delete conversation
  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent clicking through to load conversation

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/chat/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // If we deleted the current conversation, clear it
      if (currentConversation === conversationId) {
        setCurrentConversation(null)
        setMessages([])
      }

      await loadConversations()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedPhoto(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload photo
  const uploadPhoto = async () => {
    if (!selectedPhoto || !currentConversation || uploadingPhoto) return

    setUploadingPhoto(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('photo', selectedPhoto)
      formData.append('conversation_id', currentConversation)
      formData.append('message', input || 'Uploaded photo for analysis')

      const response = await axios.post(`${API_URL}/chat/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // Add messages to UI
      const photoMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input || 'Uploaded photo for analysis',
        photo_url: response.data.photo_url,
        timestamp: new Date().toISOString()
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, photoMessage, assistantMessage])

      // Clear input and photo
      setInput('')
      setSelectedPhoto(null)
      setPhotoPreview(null)

      await loadConversations()
    } catch (error) {
      console.error('Failed to upload photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Send message with streaming
  const sendMessage = async () => {
    // If photo is selected, upload it instead
    if (selectedPhoto) {
      await uploadPhoto()
      return
    }

    if (!input.trim() || !currentConversation || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setIsStreaming(true)

    // Add user message immediately
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    // Add placeholder for assistant response
    const tempAssistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempAssistantMsg])

    try {
      // Create abort controller for this stream
      abortControllerRef.current = new AbortController()

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: currentConversation,
          message: userMessage
        }),
        signal: abortControllerRef.current.signal
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'text') {
                  assistantContent += data.content
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content = assistantContent
                    return newMessages
                  })
                } else if (data.type === 'done') {
                  break
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      await loadConversations()
    } catch (error: any) {
      // Don't show error if stream was intentionally aborted
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user')
      } else {
        console.error('Failed to send message:', error)
        setMessages(prev => prev.slice(0, -2))
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const getRoleGreeting = () => {
    if (userRole === 'customer') {
      return 'Let\'s get your HD520 back up and running. What issue are you experiencing?'
    } else if (userRole === 'technician' || userRole === 'admin') {
      return 'Ready to help you troubleshoot. What\'s the issue with the HD520?'
    } else {
      return 'I\'m here to help you learn while we fix your HD520. What brings you here today?'
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-dark-border bg-dark-card flex flex-col">
        <div className="p-4 border-b border-dark-border">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-dark-text transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <h2 className="text-xl font-bold text-dark-text">Maintenance Chat</h2>
          <p className="text-sm text-gray-400 mt-1">AI-Powered Troubleshooting</p>
        </div>

        <button
          onClick={createNewConversation}
          className="m-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Conversation</span>
        </button>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-8">
              No conversations yet.<br />Start a new one!
            </p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                  currentConversation === conv.id
                    ? 'bg-orange-500/20 border border-orange-500'
                    : 'hover:bg-dark-hover border border-transparent'
                }`}
              >
                <div onClick={() => loadMessages(conv.id)} className="flex-1 pr-8">
                  <div className="text-dark-text font-medium text-sm truncate">
                    {conv.title || 'New Conversation'}
                  </div>
                  {conv.last_message && (
                    <div className="text-gray-400 text-xs truncate mt-1">
                      {conv.last_message.substring(0, 50)}...
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center mt-12">
                  <div className="inline-block bg-dark-card rounded-2xl p-8 border border-dark-border max-w-2xl">
                    <h3 className="text-2xl font-bold text-dark-text mb-3">
                      👋 Hey {userName}!
                    </h3>
                    <p className="text-gray-400 mb-4 text-lg">
                      {getRoleGreeting()}
                    </p>
                    <div className="text-left text-gray-400 text-sm space-y-2 bg-dark-bg/50 p-4 rounded-lg">
                      <p className="font-medium text-gray-300">I can help you with:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Error code diagnosis and troubleshooting</li>
                        <li>• Head alignment and maintenance procedures</li>
                        <li>• Print quality issues and nozzle checks</li>
                        <li>• Step-by-step repair guidance with videos</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-3 italic">
                        I'll ask ONE question at a time to systematically diagnose your issue.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl px-6 py-4 ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-dark-card border border-dark-border text-dark-text'
                      }`}
                    >
                      {msg.photo_url && (
                        <div className="mb-3">
                          <img
                            src={API_URL.replace('/api', '') + msg.photo_url}
                            alt="Uploaded"
                            className="rounded-lg max-w-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(API_URL.replace('/api', '') + msg.photo_url, '_blank')}
                          />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'assistant' && !msg.content && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-dark-border p-4 bg-dark-card">
              {photoPreview && (
                <div className="max-w-4xl mx-auto mb-3 relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="rounded-lg max-h-40 border-2 border-orange-500"
                  />
                  <button
                    onClick={() => {
                      setSelectedPhoto(null)
                      setPhotoPreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/jpg,image/png,image/heic"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming || uploadingPhoto}
                  className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors disabled:opacity-50"
                  title="Upload photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={selectedPhoto ? "Add a message about the photo..." : "Describe your issue..."}
                  disabled={isStreaming || uploadingPhoto}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={(isStreaming || uploadingPhoto) || (!input.trim() && !selectedPhoto)}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStreaming ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-dark-text mb-2">No Conversation Selected</h3>
              <p className="text-gray-400 mb-6">
                Create a new conversation or select an existing one
              </p>
              <button
                onClick={createNewConversation}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Start New Conversation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MaintenancePage
