import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import DesignSystem from "./pages/DesignSystem";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "design-system", element: <DesignSystem /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
