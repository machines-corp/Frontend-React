import './home.css'

function Home(){
    
    return (
        <>
            <div className='home-page'>
                {/* Hero Section */}
                <div className='hero-section'>
                    <div className='hero-content'>
                        <div className='hero-text'>
                            <h1 className='hero-title'>
                                Encuentra tu <span className='gradient-text'>empleo ideal</span> 
                                <br />con tecnología del futuro
                            </h1>
                            <p className='hero-description'>
                                Conectamos talentos excepcionales con empresas innovadoras usando 
                                inteligencia artificial avanzada para crear matches perfectos.
                            </p>
                            <div className='hero-buttons'>
                                <button className='btn-primary'>
                                    <span className='btn-icon'>🚀</span>
                                    Buscar Empleos
                                </button>
                                <button className='btn-secondary'>
                                    <span className='btn-icon'>💼</span>
                                    Crear Perfil
                                </button>
                            </div>
                        </div>
                        <div className='hero-visual'>
                            <div className='floating-card card-1'>
                                <div className='card-icon'>💻</div>
                                <div className='card-text'>Desarrollador Full Stack</div>
                            </div>
                            <div className='floating-card card-2'>
                                <div className='card-icon'>🎨</div>
                                <div className='card-text'>Diseñador UX/UI</div>
                            </div>
                            <div className='floating-card card-3'>
                                <div className='card-icon'>📊</div>
                                <div className='card-text'>Analista de Datos</div>
                            </div>
                        </div>
                    </div>
                    <div className='hero-background'>
                        <div className='hero-grid'></div>
                        <div className='hero-particles'>
                            <div className='particle'></div>
                            <div className='particle'></div>
                            <div className='particle'></div>
                            <div className='particle'></div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className='features-section'>
                    <div className='features-container'>
                        <div className='section-header'>
                            <h2 className='section-title'>¿Por qué elegir IntegraJob?</h2>
                            <p className='section-subtitle'>
                                Tecnología de vanguardia para revolucionar tu búsqueda de empleo
                            </p>
                        </div>
                        <div className='features-grid'>
                            <div className='feature-card'>
                                <div className='feature-icon'>
                                    <div className='icon-bg'>🤖</div>
                                </div>
                                <h3 className='feature-title'>IA Avanzada</h3>
                                <p className='feature-description'>
                                    Nuestro algoritmo de IA analiza tu perfil y encuentra las mejores 
                                    oportunidades que coincidan con tus habilidades y aspiraciones.
                                </p>
                            </div>
                            <div className='feature-card'>
                                <div className='feature-icon'>
                                    <div className='icon-bg'>⚡</div>
                                </div>
                                <h3 className='feature-title'>Matches Instantáneos</h3>
                                <p className='feature-description'>
                                    Recibe notificaciones en tiempo real cuando aparecen empleos 
                                    perfectos para ti, sin perder tiempo buscando.
                                </p>
                            </div>
                            <div className='feature-card'>
                                <div className='feature-icon'>
                                    <div className='icon-bg'>🎯</div>
                                </div>
                                <h3 className='feature-title'>Precisión Total</h3>
                                <p className='feature-description'>
                                    Nuestro sistema aprende de tus preferencias para ofrecerte 
                                    cada vez mejores oportunidades de trabajo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className='stats-section'>
                    <div className='stats-container'>
                        <div className='stat-item'>
                            <div className='stat-number'>10K+</div>
                            <div className='stat-label'>Empleos Activos</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>50K+</div>
                            <div className='stat-label'>Usuarios Activos</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>95%</div>
                            <div className='stat-label'>Tasa de Éxito</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-number'>24/7</div>
                            <div className='stat-label'>Soporte IA</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className='cta-section'>
                    <div className='cta-container'>
                        <div className='cta-content'>
                            <h2 className='cta-title'>¿Listo para el futuro del empleo?</h2>
                            <p className='cta-description'>
                                Únete a miles de profesionales que ya encontraron su trabajo ideal 
                                con nuestra plataforma inteligente.
                            </p>
                            <button className='cta-button'>
                                <span className='btn-icon'>🚀</span>
                                Comenzar Ahora
                                <div className='button-glow'></div>
                            </button>
                        </div>
                        <div className='cta-visual'>
                            <div className='cta-card'>
                                <div className='cta-card-header'>
                                    <div className='cta-avatar'></div>
                                    <div className='cta-info'>
                                        <div className='cta-name'>María González</div>
                                        <div className='cta-role'>Desarrolladora Senior</div>
                                    </div>
                                </div>
                                <div className='cta-message'>
                                    "Encontré mi trabajo ideal en solo 3 días usando IntegraJob. 
                                    La IA realmente entiende lo que busco."
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
