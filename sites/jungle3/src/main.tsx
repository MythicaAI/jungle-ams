import ReactDOM from "react-dom/client";
import Root from "./Root";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
