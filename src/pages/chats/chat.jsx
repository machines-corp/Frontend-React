import { useState, useRef, useEffect } from 'react'
import './chat.css'

const API_BASE = 'http://localhost:8080' // Cambia si usas proxy o backend distinto

function Chat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [taxonomy, setTaxonomy] = useState(null)
  const [slotsState, setSlotsState] = useState({}) // Estado de los slots
  const [selectedJob, setSelectedJob] = useState(null) // Empleo seleccionado para mostrar en modal
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

  // Cargar estado de slots desde el backend
  const loadSlotsState = async (convId) => {
    if (!convId) return
    try {
      const res = await fetch(`${API_BASE}/api/chat/${convId}/state`)
      const data = await res.json()
      console.log('📊 Estado de slots obtenido:', data.state)
      if (data.state) {
        setSlotsState(data.state)
      }
    } catch (e) {
      console.log('⚠️ No se pudo cargar el estado de slots:', e)
    }
  }

  // Iniciar conversación
  useEffect(() => {
    const start = async () => {
      try {
        await loadTaxonomy()
        const res = await fetch(`${API_BASE}/api/chat/start`, { method: 'POST' })
        const data = await res.json()
        setConversationId(data.conversation_id)
        // Cargar estado inicial de slots desde el backend
        await loadSlotsState(data.conversation_id)
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

      // Actualizar estado de slots si viene en la respuesta
      if (data.filled) {
        console.log('✅ Estado de slots recibido en respuesta:', data.filled)
        setSlotsState(data.filled)
      } else {
        // Si no viene en la respuesta, consultar el endpoint de estado
        console.log('⚠️ Estado no viene en la respuesta, consultando endpoint...')
        await loadSlotsState(conversationId)
      }

      let assistantText = ''
      if (data.type === 'question') {
        assistantText = data.message || 'Cuéntame un poco más.'
        if (messages.length <= 2 && taxonomy) {
          const suggestions = getQuickSuggestions()
          if (suggestions.length > 0) assistantText += '\n\n' + suggestions.join('\n')
        }
      } else if (data.type === 'results') assistantText = formatResults(data)
      else if (data.type === 'job_details') {
        // Mostrar mensaje simple y abrir modal con detalles completos
        assistantText = data.message || 'Aquí tienes los detalles del empleo seleccionado.'
        if (data.job_data) {
          setSelectedJob(data.job_data)
        }
      } else assistantText = data.message || `Entendido. ¿Podrías precisar un poco más?`

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

  // Configuración de slots con etiquetas y iconos
  const slotsConfig = [
    { key: 'industry', label: 'Industria', icon: '🏢', description: 'Sector de trabajo' },
    { key: 'area', label: 'Área', icon: '💼', description: 'Área funcional' },
    { key: 'modality', label: 'Modalidad', icon: '🏠', description: 'Tipo de trabajo' },
    { key: 'seniority', label: 'Experiencia', icon: '⭐', description: 'Nivel de experiencia' },
    { key: 'location', label: 'Ubicación', icon: '📍', description: 'Ciudad o región' },
  ]

  // Calcular progreso de slots
  const getSlotsProgress = () => {
    const totalSlots = slotsConfig.length
    const filledSlots = slotsConfig.filter(slot => {
      const value = slotsState[slot.key]
      if (!value) return false
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== null
    }).length
    return { filled: filledSlots, total: totalSlots, percentage: Math.round((filledSlots / totalSlots) * 100) }
  }

  const progress = getSlotsProgress()

  return (
    <div className="chat-wrapper">
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

      {/* Sección de Taxonomía */}
      <div className="taxonomy-sidebar">
        <div className="taxonomy-header">
          <h3>📋 Tu Perfil de Búsqueda</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress.filled}/{progress.total} completados</span>
          </div>
        </div>

        <div className="slots-list">
          {slotsConfig.map((slot) => {
            const value = slotsState[slot.key]
            let isFilled = false
            let displayValue = ''
            
            if (value) {
              if (Array.isArray(value)) {
                isFilled = value.length > 0
                displayValue = value.join(', ')
              } else {
                isFilled = value !== '' && value !== null
                displayValue = String(value)
              }
            }

            return (
              <div key={slot.key} className={`slot-item ${isFilled ? 'filled' : 'empty'}`}>
                <div className="slot-icon">{slot.icon}</div>
                <div className="slot-content">
                  <div className="slot-header">
                    <span className="slot-label">{slot.label}</span>
                    <span className={`slot-status ${isFilled ? 'completed' : 'pending'}`}>
                      {isFilled ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="slot-description">{slot.description}</div>
                  {isFilled && (
                    <div className="slot-value">{displayValue}</div>
                  )}
                  {!isFilled && (
                    <div className="slot-placeholder">Pendiente...</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {progress.filled >= 2 && progress.filled < progress.total && (
          <div className="taxonomy-tip">
            💡 Ya tienes información suficiente para buscar empleos. Puedes decir "buscar" o "muéstrame empleos" en cualquier momento.
          </div>
        )}

        {progress.filled === progress.total && (
          <div className="taxonomy-tip success">
            🎉 ¡Perfecto! Tienes toda la información necesaria. Puedo mostrarte los mejores empleos ahora.
          </div>
        )}
      </div>

      {/* Modal de Detalles del Empleo */}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}

// Componente Modal de Detalles del Empleo
function JobDetailsModal({ job, onClose }) {
  if (!job) return null

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getModalityIcon = (modality) => {
    if (!modality) return '🏢'
    const mod = modality.toLowerCase()
    if (mod.includes('remoto')) return '🏠'
    if (mod.includes('híbrido') || mod.includes('hibrido')) return '🏢🏠'
    return '🏢'
  }

  return (
    <div className="job-modal-overlay" onClick={onClose}>
      <div className="job-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="job-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {/* Header con Título y Empresa */}
        <div className="job-modal-header">
          <h1 className="job-modal-title">{job.title || 'Sin título'}</h1>
          <div className="job-modal-company">
            <div className="company-info">
              <span className="company-name">{job.company?.name || 'Empresa no especificada'}</span>
              {job.company?.verified && (
                <span className="company-verified" title="Empresa verificada">✓ Verificada</span>
              )}
              {job.company?.rating && (
                <span className="company-rating">⭐ {job.company.rating.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className="job-modal-content">
          <div className="job-info-grid">
            {/* Ubicación */}
            {job.location?.raw_text && (
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div className="info-content">
                  <span className="info-label">Ubicación</span>
                  <span className="info-value">{job.location.raw_text}</span>
                </div>
              </div>
            )}

            {/* Modalidad */}
            {job.work_modality && (
              <div className="info-item">
                <span className="info-icon">{getModalityIcon(job.work_modality)}</span>
                <div className="info-content">
                  <span className="info-label">Modalidad</span>
                  <span className="info-value">{job.work_modality}</span>
                </div>
              </div>
            )}

            {/* Área */}
            {job.area && (
              <div className="info-item">
                <span className="info-icon">💼</span>
                <div className="info-content">
                  <span className="info-label">Área</span>
                  <span className="info-value">{job.area}</span>
                </div>
              </div>
            )}

            {/* Subárea */}
            {job.subarea && (
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <div className="info-content">
                  <span className="info-label">Subárea</span>
                  <span className="info-value">{job.subarea}</span>
                </div>
              </div>
            )}

            {/* Salario */}
            {job.salary_text && (
              <div className="info-item">
                <span className="info-icon">💰</span>
                <div className="info-content">
                  <span className="info-label">Salario</span>
                  <span className="info-value salary-value">{job.salary_text}</span>
                </div>
              </div>
            )}

            {/* Tipo de Contrato */}
            {job.contract_type && (
              <div className="info-item">
                <span className="info-icon">📄</span>
                <div className="info-content">
                  <span className="info-label">Tipo de Contrato</span>
                  <span className="info-value">{job.contract_type}</span>
                </div>
              </div>
            )}

            {/* Jornada */}
            {job.workday && (
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <div className="info-content">
                  <span className="info-label">Jornada</span>
                  <span className="info-value">{job.workday}</span>
                </div>
              </div>
            )}

            {/* Experiencia Mínima */}
            {job.min_experience && (
              <div className="info-item">
                <span className="info-icon">⭐</span>
                <div className="info-content">
                  <span className="info-label">Experiencia Mínima</span>
                  <span className="info-value">{job.min_experience}</span>
                </div>
              </div>
            )}

            {/* Educación Mínima */}
            {job.min_education && (
              <div className="info-item">
                <span className="info-icon">🎓</span>
                <div className="info-content">
                  <span className="info-label">Educación Mínima</span>
                  <span className="info-value">{job.min_education}</span>
                </div>
              </div>
            )}

            {/* Fecha de Publicación */}
            {job.published_date && (
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div className="info-content">
                  <span className="info-label">Publicado</span>
                  <span className="info-value">{formatDate(job.published_date)}</span>
                </div>
              </div>
            )}

            {/* Fuente */}
            {job.source?.name && (
              <div className="info-item">
                <span className="info-icon">🔗</span>
                <div className="info-content">
                  <span className="info-label">Fuente</span>
                  <span className="info-value">{job.source.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Badges de Inclusión */}
          {(job.disability_friendly || job.accessibility_mentioned || job.transport_mentioned || 
            (job.accessibility_tags && job.accessibility_tags.length > 0) ||
            (job.transport_tags && job.transport_tags.length > 0)) && (
            <div className="inclusion-badges">
              <h3 className="section-title">♿ Características de Inclusión</h3>
              <div className="badges-list">
                {job.disability_friendly && (
                  <span className="badge badge-inclusive">✓ Apto para personas con discapacidad</span>
                )}
                {job.accessibility_mentioned && (
                  <span className="badge badge-accessibility">♿ Menciona accesibilidad</span>
                )}
                {job.transport_mentioned && (
                  <span className="badge badge-transport">🚌 Menciona transporte</span>
                )}
                {job.multiple_vacancies && (
                  <span className="badge badge-multiple">📋 Múltiples vacantes</span>
                )}
                {job.accessibility_tags && job.accessibility_tags.length > 0 && 
                  job.accessibility_tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-tag">{tag}</span>
                  ))
                }
                {job.transport_tags && job.transport_tags.length > 0 &&
                  job.transport_tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-tag">{tag}</span>
                  ))
                }
              </div>
            </div>
          )}

          {/* Beneficios */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="benefits-section">
              <h3 className="section-title">🎁 Beneficios</h3>
              <div className="benefits-list">
                {job.benefits.map((benefit, idx) => (
                  <span key={idx} className="benefit-item">✓ {benefit}</span>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {job.description && (
            <div className="description-section">
              <h3 className="section-title">📝 Descripción del Empleo</h3>
              <div className="description-text" dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
            </div>
          )}

          {/* Botón de Acción */}
          {job.url && (
            <div className="job-modal-actions">
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
              >
                🔗 Ver Empleo Completo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat