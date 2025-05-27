import './App.css';
import { FractalViewer } from './FractalViewer';

function App() {
  return (
    <div>
      <h1
        style={{
          padding: 20,
          cursor: 'pointer',
          color: '#eeeee4',
          fontFamily: 'Arial, sans-serif', // Changed font
          fontSize: '2.5rem', // Increased font size
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Added outline effect
          textAlign: 'center', // Centered the title
        }}
        onClick={() => {
          window.location.reload(); // Reload the page to reset the app state
        }}
      >
        Fractal Knowledge
      </h1>
      <FractalViewer />
    </div>
  );
}

export default App;