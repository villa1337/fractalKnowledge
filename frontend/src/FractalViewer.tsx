import React, { useEffect, useState, type JSX } from "react";
import { locales } from './locales';

type Node = {
  title: string;
  type: string;
  value?: string;
  media?: string;
  preview?: string[];
  action?: string;
  children?: Node[];
};

const renderNode = (node: Node, onExpand: (keyword: string) => void): JSX.Element => {
  return (
    <div style={{ margin: '10px auto', textAlign: 'center' }}> {/* Centered content */}
      <h4
        style={{ cursor: 'pointer', color: '#1E90FF' }} // Link color for titles
        onClick={() => onExpand(node.title)}
      >
        {node.title}
      </h4>
      {node.value && (
        <p style={{ color: '#555555' }}>
          {node.value}
        </p>
      )}
      {node.media && (
        <div>
          <img
            src={node.media}
            alt={node.title}
            style={{ width: 100, cursor: 'pointer', display: 'block', margin: '0 auto' }} // Centered image
            onClick={() => onExpand(node.title)}
          />
        </div>
      )}
      {node.preview && (
        <ul style={{ listStyleType: 'none', padding: 0 }}> {/* Centered list */}
          {node.preview.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {node.children && node.children.map((child) => renderNode(child, onExpand))}
    </div>
  );
};

export const FractalViewer: React.FC<{ language: 'en' | 'es' }> = ({ language }) => {
  const [concept, setConcept] = useState<Node | null>(null);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<Node[]>([]);
  const [forwardHistory, setForwardHistory] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'; // Default to localhost if not set

  const fetchConcept = async (keyword: string) => {
    setLoading(true);
    setQuery(keyword);
    if (concept) {
      setHistory((prev) => [...prev, concept]);
    }

    try {
      const res = await fetch(`${backendUrl}/concept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, language }),
      });
      const data = await res.json();
      setConcept(data);
    } catch (error) {
      console.error("Failed to fetch concept:", error);
    } finally {
      setLoading(false);
    }
  };

  const goForward = () => {
    setForwardHistory((prev) => {
      const newForwardHistory = [...prev];
      const next = newForwardHistory.pop();
      if (next) {
        setHistory((prevHistory) => [...prevHistory, concept!]);
        setConcept(next);
      }
      return newForwardHistory;
    });
  };

  const querySelectedText = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      fetchConcept(selectedText);
    } else {
      alert(language === 'es' ? "No se seleccionó texto" : "No text selected");
    }
  };

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const previous = newHistory.pop();
      if (previous) {
        setForwardHistory((prevForward) => [...prevForward, concept!]);
        setConcept(previous);
      }
      return newHistory;
    });
  };

  useEffect(() => {
    if (query) fetchConcept(query); // Only fetch if query is not empty
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchConcept(query);
            }
          }}
          placeholder={language === 'es' ? 'Introduce un concepto...' : 'Enter a concept...'}
          style={{
            padding: 10,
            borderRadius: 5,
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            width: 'calc(100% - 40px)',
            maxWidth: 300,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={() => fetchConcept(query)}
          disabled={loading}
          style={{
            padding: '10px',
            borderRadius: 5,
            backgroundColor: loading ? '#ccc' : '#98F3B6',
            color: loading ? '#888' : '#435047',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: 'calc(100% - 40px)',
            maxWidth: 300,
            boxSizing: 'border-box',
          }}
        >
          {locales[language].search}
        </button>
        <button
          onClick={querySelectedText}
          style={{
            padding: '10px',
            borderRadius: 5,
            backgroundColor: '#1E90FF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            width: 'calc(100% - 40px)',
            maxWidth: 300,
            boxSizing: 'border-box',
          }}
        >
          {locales[language].querySelectedText}
        </button>
        <button
          onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, '_blank')}
          style={{
            padding: '10px',
            borderRadius: 5,
            backgroundColor: '#FFDD57',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            width: 'calc(100% - 40px)',
            maxWidth: 300,
            boxSizing: 'border-box',
          }}
        >
          {locales[language].searchOnline}
        </button>
        {history.length > 0 && (
          <button
            onClick={goBack}
            style={{
              padding: '10px 20px',
              borderRadius: 5,
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {locales[language].back}
          </button>
        )}
        {forwardHistory.length > 0 && (
          <button
            onClick={goForward}
            style={{
              padding: '10px 20px',
              borderRadius: 5,
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {locales[language].forward}
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #ccc',
              borderTop: '4px solid #1E90FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>
      ) : (
        <div>{concept && renderNode(concept, fetchConcept)}</div>
      )}
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};