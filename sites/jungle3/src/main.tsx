import ReactDOM from "react-dom/client";
import Root from "./Root";
import "./styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";

const router = createBrowserRouter([
  {
    path: "*",
    element: <Root />,
  },
]);

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<RouterProvider router={router} />);
}
