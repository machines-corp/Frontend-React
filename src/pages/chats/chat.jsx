import { useState, useRef, useEffect } from 'react'
import './chat.css'

const API_BASE = 'http://localhost:8080' // ej: '' si proxy, o 'http://localhost:8000'

function Chat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Iniciar conversación con el backend (recibe la 1ª pregunta/saludo)
  useEffect(() => {
    const start = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/start`, { method: 'POST' })
        const data = await res.json()
        setConversationId(data.conversation_id)
        setMessages([{
          id: Date.now(),
          text: data.message || '¡Hola! Soy tu asistente de chat. ¿En qué puedo ayudarte hoy?',
          isUser: false,
          timestamp: new Date()
        }])
      } catch (e) {
        // fallback si el backend no responde
        setMessages([{
          id: Date.now(),
          text: 'No pude iniciar la conversación con el servidor. Intenta nuevamente en unos segundos.',
          isUser: false,
          timestamp: new Date()
        }])
      }
    }
    start()
  }, [])

  // Formatea la respuesta de resultados del backend a texto amigable
  const formatResults = (data) => {
    const items = Array.isArray(data?.results) ? data.results : []
    if (!items.length) return 'No encontré resultados con tus preferencias. Podemos relajar filtros o cambiar alguna opción.'
    const lines = items.map((j, i) => {
      const rango = (j.salary_min || j.salary_max)
        ? `${j.currency || ''} ${j.salary_min ?? ''}${j.salary_min && j.salary_max ? ' - ' : ''}${j.salary_max ?? ''}`
        : 'Sin rango publicado'
      return `${i + 1}) ${j.title} – ${j.role} · ${j.location} · ${rango}`
    })
    return `Te recomiendo:\n\n${lines.join('\n')}\n\nEscribe "Listo" o "Recomienda" cuando quieras ver sugerencias en cualquier momento.`
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    const toSend = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/chat/${conversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: toSend })
      })
      const data = await res.json()

      // El backend puede devolver:
      // {type:"question", message:"..."}  -> siguiente pregunta
      // {type:"results", results:[...]}   -> recomendaciones
      // o {message:"..."}                 -> fallback
      let assistantText = ''
      if (data.type === 'question') {
        assistantText = data.message || 'Cuéntame un poco más.'
      } else if (data.type === 'results') {
        assistantText = formatResults(data)
      } else {
        assistantText = data.message || `Entendido. ¿Podrías precisar un poco más?`
      }

      const assistantMessage = {
        id: Date.now() + 1,
        text: assistantText,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 2,
        text: 'Hubo un problema al comunicar con el servidor. Intenta otra vez.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}>
            <div className="message-avatar">
              {message.isUser ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Escribe tu respuesta… (p.ej. "Tecnología", "Remoto", "Junior", "Listo")'
            className="chat-input"
            rows="1"
            disabled={isLoading || !conversationId}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || isLoading || !conversationId}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat