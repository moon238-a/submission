import { getActiveRoute } from '../routes/url-parser.js';
import CONFIG from '../config.js';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

    if (accessToken === null || accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    console.log('getAccessToken:', CONFIG.ACCESS_TOKEN_KEY);
    return accessToken;
  } catch (error) {
    console.log('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }

    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    console.log('putAccessToken:', CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    console.log('getLogout:', CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();
  const isGuest = isGuestMode();

  if (unauthenticatedRoutesOnly.includes(url) && (isLogin || isGuest)) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();
  const isGuest = isGuestMode();
  const url = getActiveRoute();

  if (isLogin) {
    return page;
  }

  if (isGuest && url === '/') {
    return page;
  }

  if (isGuest && url === '/new') {
    if (hasGuestCreatedStory()) {
      location.hash = '/';
      return null;
    }

    return page;
  }

  location.hash = isGuest ? '/' : '/login';
  return null;
}

export function getLogout() {
  removeAccessToken();
}

const GUEST_MODE_KEY = 'guestmode';
const GUEST_STORY_CREATED_KEY = 'guestStoryCreated';
const GUEST_STORIES_KEY = 'guestStories';

export function startGuestSession() {
  sessionStorage.setItem(GUEST_MODE_KEY, 'true');
}

export function isGuestMode() {
  return sessionStorage.getItem(GUEST_MODE_KEY) === 'true';
}

export function saveGuestStory(story) {
  const stories = getGuestStories();
  stories.unshift(story);

  sessionStorage.setItem(GUEST_STORIES_KEY, JSON.stringify(stories));
}

export function getGuestStories() {
  return JSON.parse(sessionStorage.getItem(GUEST_STORIES_KEY) || '[]');
}

export function hasGuestCreatedStory() {
  return sessionStorage.getItem(GUEST_STORY_CREATED_KEY) === 'true';
}

export function markGuestCreatedStory() {
  return sessionStorage.setItem(GUEST_STORY_CREATED_KEY, 'true');
}

export function endGuestSession() {
  sessionStorage.removeItem(GUEST_MODE_KEY);
  sessionStorage.removeItem(GUEST_STORY_CREATED_KEY);
  sessionStorage.removeItem(GUEST_STORIES_KEY);
}
