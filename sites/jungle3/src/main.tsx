import ReactDOM from 'react-dom/client';
import Root from './Root';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<Root />);
}
