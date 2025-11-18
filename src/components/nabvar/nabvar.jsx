import { Link, useLocation } from 'react-router-dom'
import './nabvar.css'

function Nabvar(){
    const location = useLocation();

    return (
        <>
            <nav className="nabvar">
                <div className="nav-container">
                    <div className="nav-links">
                        <Link 
                            to="/" 
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🏠</span>
                            <span className="nav-text">Inicio</span>
                            <div className="nav-glow"></div>
                        </Link>
                        <Link 
                            to="/chat" 
                            className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">💬</span>
                            <span className="nav-text">Chat IA</span>
                            <div className="nav-glow"></div>
                        </Link>
                        <Link to="/job-form" 
                            className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
                        >
                            <span className="nav-icon">💼</span>
                            <span className="nav-text">Ofertas</span>
                            <div className="nav-glow"></div>
                        </Link>
                        <div className="nav-link">
                            <span className="nav-icon">👤</span>
                            <span className="nav-text">Perfil</span>
                            <div className="nav-glow"></div>
                        </div>
                    </div>
                </div>
                <div className="nav-background">
                    <div className="nav-gradient"></div>
                </div>
            </nav>
        </>
    );
}

export default Nabvar;