import React, { useEffect, useState, type JSX } from "react";

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
    <div style={{ marginLeft: 20, marginTop: 10 }}>
      <h4
        style={{ cursor: "pointer", color: "#1E90FF" }} // Link color for titles
        onClick={() => onExpand(node.title)}
      >
        {node.title}
      </h4>
      {node.value && (
        <p
          style={{ cursor: "pointer", color: "#555555" }} // Neutral color for values
          onClick={() => node.value && onExpand(node.value)}
        >
          {node.value}
        </p>
      )}
      {node.media && (
        <div>
          <img
            src={node.media}
            alt={node.title}
            style={{ width: 100, cursor: "pointer" }}
            onClick={() => onExpand(node.title)}
          />
          {node.value && <p style={{ fontSize: "0.9em", color: "gray" }}>{node.value}</p>}
        </div>
      )}
      {node.preview && (
        <ul>
          {node.preview.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {node.children && node.children.map((child) => renderNode(child, onExpand))}
    </div>
  );
};

export const FractalViewer: React.FC = () => {
  const [concept, setConcept] = useState<Node | null>(null);
  const [query, setQuery] = useState(""); // Removed placeholder "nissan"
  const [history, setHistory] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConcept = async (keyword: string) => {
    setLoading(true);
    if (concept) {
      setHistory((prev) => [...prev, concept]);
    }

    try {
      const res = await fetch(`https://fractalknowledge-production.up.railway.app/concept/${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setConcept(data);
      setQuery(data.title); // Update query with the current concept's title
    } catch (error) {
      console.error("Failed to fetch concept:", error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const previous = newHistory.pop();
      if (previous) setConcept(previous);
      return newHistory;
    });
  };

  useEffect(() => {
    if (query) fetchConcept(query); // Only fetch if query is not empty
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            fetchConcept(query);
          }
        }}
        placeholder="Enter a concept..."
        style={{ marginBottom: 10, padding: 5, marginRight: 10 }} // Added margin-right for spacing
      />
      <button onClick={() => fetchConcept(query)} style={{ marginRight: 10 }}>
        Search
      </button>
      {history.length > 0 && (
        <button onClick={goBack} style={{ marginRight: 10 }}>
          Back
        </button>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>{concept && renderNode(concept, fetchConcept)}</div>
      )}
    </div>
  );
};