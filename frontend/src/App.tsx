import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Fundos from "./pages/Fundos";
import DesignSystem from "./pages/DesignSystem";
import ComingSoon from "./pages/ComingSoon";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "fundos", element: <Fundos /> },
      { path: "design-system", element: <DesignSystem /> },
      { path: "investidores", element: <ComingSoon /> },
      { path: "relatorios", element: <ComingSoon /> },
      { path: "compliance", element: <ComingSoon /> },
      { path: "*", element: <ComingSoon /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
