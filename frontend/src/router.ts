import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Fundos from './pages/Fundos';
import DesignSystem from './pages/DesignSystem';
import ComingSoon from './pages/ComingSoon';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: ComingSoon,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const fundosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fundos',
  component: Fundos,
});

const fundosNovoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fundos/novo',
  component: ComingSoon,
});

const fundosDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fundos/$id',
  component: ComingSoon,
});

const designSystemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design-system',
  component: DesignSystem,
});

const investidoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investidores',
  component: ComingSoon,
});

const relatoriosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relatorios',
  component: ComingSoon,
});

const complianceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compliance',
  component: ComingSoon,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  fundosRoute,
  fundosNovoRoute,
  fundosDetailRoute,
  designSystemRoute,
  investidoresRoute,
  relatoriosRoute,
  complianceRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
