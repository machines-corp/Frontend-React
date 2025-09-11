import './footer.css'

function Footer(){
    return (
        <>
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo">
                                <div className="footer-logo-icon">
                                    <div className="footer-logo-gradient"></div>
                                </div>
                                <span className="footer-logo-text">IntegraJob</span>
                            </div>
                            <p className="footer-description">
                                La plataforma del futuro para conectar talentos excepcionales 
                                con oportunidades de trabajo innovadoras.
                            </p>
                            <div className="footer-social">
                                <div className="social-link">
                                    <span className="social-icon">📱</span>
                                </div>
                                <div className="social-link">
                                    <span className="social-icon">💼</span>
                                </div>
                                <div className="social-link">
                                    <span className="social-icon">🌐</span>
                                </div>
                                <div className="social-link">
                                    <span className="social-icon">📧</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="footer-section">
                            <h3 className="footer-title">Enlaces Rápidos</h3>
                            <ul className="footer-links">
                                <li><a href="#" className="footer-link">Buscar Empleos</a></li>
                                <li><a href="#" className="footer-link">Crear Perfil</a></li>
                                <li><a href="#" className="footer-link">Chat IA</a></li>
                                <li><a href="#" className="footer-link">Recursos</a></li>
                            </ul>
                        </div>
                        
                        <div className="footer-section">
                            <h3 className="footer-title">Empresas</h3>
                            <ul className="footer-links">
                                <li><a href="#" className="footer-link">Publicar Oferta</a></li>
                                <li><a href="#" className="footer-link">Buscar Talentos</a></li>
                                <li><a href="#" className="footer-link">Soluciones IA</a></li>
                                <li><a href="#" className="footer-link">Precios</a></li>
                            </ul>
                        </div>
                        
                        <div className="footer-section">
                            <h3 className="footer-title">Soporte</h3>
                            <ul className="footer-links">
                                <li><a href="#" className="footer-link">Centro de Ayuda</a></li>
                                <li><a href="#" className="footer-link">Contacto</a></li>
                                <li><a href="#" className="footer-link">Privacidad</a></li>
                                <li><a href="#" className="footer-link">Términos</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="footer-bottom">
                        <div className="footer-bottom-content">
                            <p className="footer-copyright">
                                © 2025 IntegraJob. Todos los derechos reservados.
                            </p>
                            <div className="footer-tech">
                                <span className="tech-badge">🚀 Powered by Machines Corp</span>
                                <span className="tech-badge">⚡ Next-Gen Platform</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="footer-background">
                    <div className="footer-grid"></div>
                    <div className="footer-particles">
                        <div className="footer-particle"></div>
                        <div className="footer-particle"></div>
                        <div className="footer-particle"></div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;