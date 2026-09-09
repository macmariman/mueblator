import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from '@/components/App';

const container = document.getElementById('root');
if (!container) throw new Error('Falta el contenedor #root en index.html');
createRoot(container).render(<App />);
