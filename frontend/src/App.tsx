import './App.css';
import { FractalViewer } from './FractalViewer';

function App() {
  return (
    <div>
      <h1
        style={{ padding: 20, cursor: 'pointer', color: '#eeeee4' }}
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