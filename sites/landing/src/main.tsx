// src/main.tsx
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/700.css';

// Add global styles
import './styles/globalStyles.ts';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import Root from "./Root.tsx";

const router = createBrowserRouter([
  {
    path: "*",
    element: <Root />,
  },
]);

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<RouterProvider future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true,
                              }}
                              router={router} />);
}