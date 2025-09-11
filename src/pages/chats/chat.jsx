import { useState, useRef, useEffect } from 'react'
import './chat.css'

function Chat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "¡Hola! Soy tu asistente de chat. ¿En qué puedo ayudarte hoy?",
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

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
        setInputMessage('')
        setIsLoading(true)

        // Simular respuesta del asistente
        setTimeout(() => {
            const assistantMessage = {
                id: Date.now() + 1,
                text: `Recibí tu mensaje: "${inputMessage}". Esta es una respuesta simulada. En una implementación real, aquí se conectaría con una API de IA.`,
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMessage])
            setIsLoading(false)
        }, 1000)
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
                            <div className="message-text">{message.text}</div>
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
                                <span></span>
                                <span></span>
                                <span></span>
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
                        placeholder="Escribe tu mensaje aquí..."
                        className="chat-input"
                        rows="1"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={!inputMessage.trim() || isLoading}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Chat