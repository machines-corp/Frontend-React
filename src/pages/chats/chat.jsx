import { useState, useRef, useEffect } from 'react'
import './chat.css'

const API_BASE = 'http://localhost:8080' // Cambia si usas proxy o backend distinto

function Chat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [taxonomy, setTaxonomy] = useState(null)
  const listRef = useRef(null) // ✅ Nuevo ref al contenedor de mensajes

  // Auto-scroll dentro del contenedor, sin mover la página
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Cargar taxonomía disponible
  const loadTaxonomy = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/taxonomy`)
      const data = await res.json()
      setTaxonomy(data)
    } catch (e) {
      console.log('No se pudo cargar la taxonomía:', e)
    }
  }

  // Iniciar conversación
  useEffect(() => {
    const start = async () => {
      try {
        await Promise.all([
          loadTaxonomy(),
          fetch(`${API_BASE}/api/chat/start`, { method: 'POST' })
        ])
        const res = await fetch(`${API_BASE}/api/chat/start`, { method: 'POST' })
        const data = await res.json()
        setConversationId(data.conversation_id)
        setMessages([{
          id: Date.now(),
          text: data.message || '¡Hola! Soy tu asistente de empleos. ¿En qué puedo ayudarte?',
          isUser: false,
          timestamp: new Date()
        }])
      } catch {
        setMessages([{
          id: Date.now(),
          text: 'No pude iniciar la conversación con el servidor. Intenta nuevamente.',
          isUser: false,
          timestamp: new Date()
        }])
      }
    }
    start()
  }, [])

  // Formatear resultados del backend
  const formatResults = (data) => {
    const items = Array.isArray(data?.results) ? data.results : []
    if (!items.length)
      return 'No encontré resultados con tus preferencias. Podemos relajar filtros o cambiar alguna opción.'

    const lines = items.map((job, i) => {
      const title = job.title || 'Sin título'
      const company = job.company?.name || job.company_name || 'Empresa no especificada'
      const location = job.location?.raw_text || job.location || 'Ubicación no especificada'
      const area = job.area || 'Área no especificada'
      const modality = job.work_modality || job.modality || 'Modalidad no especificada'

      let salaryInfo = 'Sin rango publicado'
      if (job.salary_text) salaryInfo = job.salary_text
      else if (job.salary_min || job.salary_max) {
        const currency = job.currency || ''
        salaryInfo = `${currency} ${job.salary_min ?? ''}${job.salary_min && job.salary_max ? ' - ' : ''}${job.salary_max ?? ''}`
      }

      return `${i + 1}) ${title}\n   📍 ${company} · ${location}\n   💼 ${area} · ${modality}\n   💰 ${salaryInfo}\n   🆔 ID: ${job.id || 'N/A'}`
    })

    return `🎯 Te recomiendo estos empleos:\n\n${lines.join('\n\n')}\n\n💡 **¿Te interesa alguno?** Escribe "me gusta el 1", "elijo el 2", etc.\n\n🔄 O escribe "buscar" para ver más opciones.`
  }

  // Generar sugerencias rápidas
  const getQuickSuggestions = () => {
    if (!taxonomy) return []
    const s = []
    if (taxonomy.industries?.length > 0) s.push(`Industrias: ${taxonomy.industries.slice(0, 3).join(', ')}`)
    if (taxonomy.modalities?.length > 0) s.push(`Modalidades: ${taxonomy.modalities.join(', ')}`)
    if (taxonomy.areas?.length > 0) s.push(`Áreas: ${taxonomy.areas.slice(0, 3).join(', ')}`)
    if (taxonomy.total_jobs > 0) s.push(`📊 ${taxonomy.total_jobs} empleos disponibles`)
    return s
  }

  // Enviar mensaje
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

      let assistantText = ''
      if (data.type === 'question') {
        assistantText = data.message || 'Cuéntame un poco más.'
        if (messages.length <= 2 && taxonomy) {
          const suggestions = getQuickSuggestions()
          if (suggestions.length > 0) assistantText += '\n\n' + suggestions.join('\n')
        }
      } else if (data.type === 'results') assistantText = formatResults(data)
      else if (data.type === 'job_details')
        assistantText = data.message || 'Aquí tienes los detalles del empleo seleccionado.'
      else assistantText = data.message || `Entendido. ¿Podrías precisar un poco más?`

      const assistantMessage = {
        id: Date.now() + 1,
        text: assistantText,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: 'Hubo un problema al comunicar con el servidor. Intenta otra vez.',
        isUser: false,
        timestamp: new Date()
      }])
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
      {taxonomy && (
        <div className="chat-info-bar">
          🎯 Conectado con {taxonomy.total_jobs} empleos reales • {taxonomy.companies?.length || 0} empresas
        </div>
      )}

      <div className="chat-messages" ref={listRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}>
            <div className="message-avatar">
              {message.isUser ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              taxonomy
                ? `Escribe tu respuesta… (p.ej. "${taxonomy.industries?.[0] || 'Tecnología'}")`
                : 'Escribe tu respuesta…'
            }
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