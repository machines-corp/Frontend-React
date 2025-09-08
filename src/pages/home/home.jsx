import './home.css'

function Home(){
    
    return (
        <>
            <div className='container-fluid home-index-page'>
                <div className='row1'>
                    <aside><h1>Aside</h1></aside>
                    <section>
                        <article><h1>Article 1</h1></article>
                        <article><h1>Article 2</h1></article>
                    </section>
                </div>
                <div className='container-fluid row2'>
                    <div className='banner'><h1>Banner</h1></div>
                </div>
                <div className='row3'>
                    <section>
                        <article><h1>Article 1</h1></article>
                        <article><h1>Article 2</h1></article>
                    </section>
                    <aside><h1>Aside</h1></aside>
                </div>
            </div>
        </>
    );
}

export default Home;
