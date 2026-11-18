import RegisterPage from '../pages/auth/register/register-page.js';
import LoginPage from '../pages/auth/login/login-page.js';
import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import BookmarkPage from '../pages/bookmark/bookmark-page.js';
import NewPage from '../pages/new/new-page.js';
import StoryDetailPage from '../pages/detail/story-detail-page.js';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth.js';

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/about': () => checkAuthenticatedRoute(new AboutPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
};

export default routes;
