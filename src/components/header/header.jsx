import './header.css'

function Header(){
    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="header-logo">
                        <div className="logo-icon">
                            <div className="logo-gradient"></div>
                        </div>
                        <span className="logo-text">IntegraJob</span>
                    </div>
                    <div className="header-tagline">
                        <span className="tagline-text">Conectando talentos con oportunidades</span>
                        <div className="tagline-glow"></div>
                    </div>
                </div>
                <div className="header-background">
                    <div className="grid-pattern"></div>
                    <div className="floating-particles">
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;