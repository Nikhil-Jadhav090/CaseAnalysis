import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function ChatAssistant(){
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [accusedInfo, setAccusedInfo] = useState('')
  const [attachments, setAttachments] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize: Load a demo chat since we're using stub auth
  useEffect(() => {
    // Try to create a real session if user has an access token
    const access = localStorage.getItem('access_token')
    if (!access) {
      setMessages([
        { from: 'bot', text: '⚠️ Note: Chat requires backend API integration with JWT authentication. Backend is running at http://127.0.0.1:8000. To use this fully, log in with real credentials that authenticate against the backend API. For now, you can test the UI.' }
      ])
      return
    }

    // create a chat session on the backend
    ;(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/chat/sessions/', {
          method: 'POST',
          headers: { Authorization: `Bearer ${access}` },
        })
        if (!res.ok) throw new Error('Failed to create chat session')
        const data = await res.json()
        setSessionId(data.id)
        setMessages([{ from: 'bot', text: 'Chat session initialized. You can now ask about your case.' }])
      } catch (err) {
        console.warn('Could not initialize chat session:', err)
        setMessages([{ from: 'bot', text: '⚠️ Note: Chat requires backend API integration with JWT authentication. Backend is running at http://127.0.0.1:8000. To use this fully, log in with real credentials that authenticate against the backend API. For now, you can test the UI.' }])
      }
    })()
  }, [])

  const addAttachment = (type, file = null, text = null) => {
    if (type === 'accused') {
      if (accusedInfo.trim()) {
        setAttachments([...attachments, { type: 'accused', text: accusedInfo, display: `Accused: ${accusedInfo}` }])
        setAccusedInfo('')
      }
    } else if (file) {
      const display = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${file.name}`
      setAttachments([...attachments, { type, file, display }])
    }
    setMenuOpen(false)
  }

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return
    if (!sessionId) {
      setError('Chat session not initialized. Please reload the page.')
      return
    }

    // Add user message to UI
    const userMsg = { from: 'user', text: input, attachments: attachments.map(a => a.display) }
    setMessages(m => [...m, userMsg])
    setInput('')
    setAttachments([])
    setLoading(true)
    setError(null)

    try {
      const access = localStorage.getItem('access_token')
      if (!access) {
        // no token — show mock
        const mockResponse = `[Mock AI Response] You asked: "${input}". ${
          attachments.length > 0 ? `You also attached ${attachments.length} file(s). ` : ''
        }When authenticated with the backend and Gemini API is configured, you will receive AI-powered case analysis here.`
        await new Promise(resolve => setTimeout(resolve, 500))
        const aiMsg = { from: 'bot', text: mockResponse }
        setMessages(m => [...m, aiMsg])
        return
      }

      // Ensure we have a session
      let sid = sessionId
      if (!sid) {
        const create = await fetch('http://127.0.0.1:8000/api/chat/sessions/', {
          method: 'POST',
          headers: { Authorization: `Bearer ${access}` },
        })
        if (!create.ok) throw new Error('Failed to create chat session')
        const created = await create.json()
        sid = created.id
        setSessionId(sid)
      }

      // Build form data with attachments
      const form = new FormData()
      form.append('content', input)
      // accused info (first matching attachment)
      const accused = attachments.find(a => a.type === 'accused')
      if (accused) form.append('accused', accused.text || '')

      // Attach files
      attachments.forEach(a => {
        if (a.file) {
          if (a.type === 'evidence') form.append('evidence_files', a.file)
          else if (a.type === 'audio') form.append('audio_files', a.file)
        }
      })

      const res = await fetch(`http://127.0.0.1:8000/api/chat/sessions/${sid}/messages/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access}` },
        body: form,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Chat API error')
      }

      const body = await res.json()
      // backend returns user_message and ai_message
      const aiText = body.ai_message?.content || body.ai_message || 'No reply'
      setMessages(m => [...m, { from: 'bot', text: aiText }])

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorText = error.response?.data?.error || error.message || 'Failed to get response'
      const errorMsg = { from: 'bot', text: `❌ Error: ${errorText}` }
      setMessages(m => [...m, errorMsg])
      setError(errorText)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (type, files) => {
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        addAttachment(type, file)
      })
    }
  }

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">AI Case Analysis Chat</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg flex flex-col h-screen max-h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} px-4 py-3 rounded-lg max-w-[70%] break-words`}>
                <p>{m.text}</p>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 text-sm opacity-80">
                    {m.attachments.map((att, j) => (
                      <div key={j}>📎 {att}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg">
                <p>AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachments display */}
        {attachments.length > 0 && (
          <div className="border-t bg-gray-50 p-3">
            <p className="text-sm font-semibold mb-2">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {att.display}
                  <button onClick={() => removeAttachment(i)} className="text-red-600 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          {/* Plus menu */}
          <div className="mb-3 relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add
            </button>
            {menuOpen && (
              <div className="absolute top-10 left-0 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  📄 Evidence File
                </button>
                <button
                  onClick={() => {
                    audioInputRef.current?.click()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t"
                >
                  🎙️ Audio File
                </button>
                <div className="border-t p-2">
                  <input
                    type="text"
                    placeholder="Enter accused name"
                    value={accusedInfo}
                    onChange={e => setAccusedInfo(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    onKeyDown={e => e.key === 'Enter' && addAttachment('accused')}
                  />
                  <button
                    onClick={() => addAttachment('accused')}
                    className="mt-1 w-full text-left px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    Add Accused
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFileSelect('evidence', e.target.files)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <input
              ref={audioInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFileSelect('audio', e.target.files)}
              accept="audio/*"
            />
          </div>

          {/* Message input */}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ask about your case or evidence..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && attachments.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
