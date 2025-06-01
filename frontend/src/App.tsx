import './App.css';
import { FractalViewer } from './FractalViewer';
import { useState } from 'react';

function App() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  return (
    <div>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <button
          onClick={() => setLanguage('en')}
          style={{
            fontWeight: language === 'en' ? 'bold' : 'normal',
            opacity: language === 'en' ? 1 : 0.5,
            marginRight: 10,
          }}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('es')}
          style={{
            fontWeight: language === 'es' ? 'bold' : 'normal',
            opacity: language === 'es' ? 1 : 0.5,
          }}
        >
          Español
        </button>
      </div>
      <h1
        style={{
          padding: 20,
          cursor: 'pointer',
          color: '#eeeee4',
          fontFamily: 'Arial, sans-serif',
          fontSize: '2.5rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
        onClick={() => {
          window.location.reload();
        }}
      >
        Fractal Knowledge
      </h1>
      <FractalViewer language={language} />
    </div>
  );
}

export default App;