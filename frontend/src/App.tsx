import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';

export default function App() {
  useAuthBootstrap();
  return <RouterProvider router={router} />;
}
