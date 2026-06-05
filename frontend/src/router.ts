import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Fundos from './pages/Fundos';
import DesignSystem from './pages/DesignSystem';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import { msalInstance } from './lib/auth/msalInstance';

// Root renders the matched child via the default <Outlet /> (no component needed).
const rootRoute = createRootRoute({
  notFoundComponent: ComingSoon,
});

// Public login route (no sidebar).
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// Pathless layout that protects everything beneath it and renders the app shell (sidebar).
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  component: RootLayout,
  beforeLoad: () => {
    if (!msalInstance.getActiveAccount()) {
      throw redirect({ to: '/login' });
    }
  },
});

const indexRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/',
  component: Home,
});

const fundosRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/fundos',
  component: Fundos,
});

const fundosNovoRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/fundos/novo',
  component: ComingSoon,
});

const fundosDetailRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/fundos/$id',
  component: ComingSoon,
});

const designSystemRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/design-system',
  component: DesignSystem,
});

const investidoresRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/investidores',
  component: ComingSoon,
});

const relatoriosRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/relatorios',
  component: ComingSoon,
});

const complianceRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/compliance',
  component: ComingSoon,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authLayoutRoute.addChildren([
    indexRoute,
    fundosRoute,
    fundosNovoRoute,
    fundosDetailRoute,
    designSystemRoute,
    investidoresRoute,
    relatoriosRoute,
    complianceRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
