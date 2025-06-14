import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const NeuroNotesLogo = () => (
  <div className="logo-wrapper">
    <div className="logo-circle">
      <svg viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    </div>
    <div className="logo-text">
      <h1 className="app-title">NeuroNotes</h1>
      <p className="app-subtitle">Transform lectures into smart summaries</p>
    </div>
  </div>
);

const BrandPill = ({ children }) => (
  <span className="brand-pill">{children}</span>
);

const GenerateButton = ({ status, progress, onClick }) => {
  const handleClick = (e) => {
    if (!onClick) return;
    
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'button-ripple';
    ripple.style.left = `${e.clientX - button.getBoundingClientRect().left}px`;
    ripple.style.top = `${e.clientY - button.getBoundingClientRect().top}px`;
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === 'processing'}
      className={`action-button ${status === 'processing' ? 'processing' : ''}`}
      aria-busy={status === 'processing'}
    >
      {status === 'processing' ? (
        <>
          <div className="button-spinner"></div>
          <span>Generating</span>
          <span className="progress-percent">{progress}%</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="button-icon">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <span>Generate Summary</span>
        </>
      )}
    </button>
  );
};

function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter lecture text');
      return;
    }

    setStatus('processing');
    setError(null);
    setProgress(0);

    try {
      const { data: { id } } = await axios.post('http://localhost:8000/api/generate', {
        text,
        format: 'pdf',
      });
      checkStatus(id);
    } catch (err) {
      setStatus('error');
      setError('Failed to generate summary');
      console.error('Error:', err);
    }
  };

  const checkStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/status/${id}`);
        if (data.status === 'completed') {
          clearInterval(interval);
          setStatus('completed');
          setDownloadUrl(data.download_url);
          setProgress(100);
        } else if (data.progress) {
          setProgress(data.progress);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus('error');
        setError('Error checking status');
      }
    }, 1500);

    return () => clearInterval(interval);
  };

  return (
    <div className="app-container">
      <div className="background-glow"></div>
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--size': `${Math.random() * 5 + 2}px`,
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${Math.random() * 10 + 10}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
          }}></div>
        ))}
      </div>

      <main className="main-content">
        <div className="glass-card">
          <header className="card-header">
            <NeuroNotesLogo />
            <BrandPill>На базе искусственного интеллекта</BrandPill>
          </header>

          <div className="card-body">
            <div className="input-group">
              <div className="textarea-container">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Вставьте текст вашей лекции сюда..."
                  className="modern-textarea"
                  maxLength={5000}
                />
                <div className="textarea-controls">
                  <span className="char-count">{text.length}/5000</span>
                  {text.length > 0 && (
                    <button 
                      className="clear-button"
                      onClick={() => setText('')}
                      aria-label="Clear text"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="error-notification">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <GenerateButton 
                status={status} 
                progress={progress} 
                onClick={handleSubmit} 
              />

              {status === 'processing' && (
                <div className="progress-tracker">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              {status === 'completed' && (
                <a 
                  href={`http://localhost:8000${downloadUrl}`} 
                  download="summary.pdf"
                  className="download-button"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  <span>Download Summary</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant</h3>
            <p>Analysis in seconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Accurate</h3>
            <p>Key points extraction</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📑</div>
            <h3>Formatted</h3>
            <p>Ready-to-use PDF</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;