import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateGuestOnlyNavigationListTemplate,
  generateMainGuestOnlyNavigationListTemplate,
  generateGuestHasCreatedStoryNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate
} from '../templates.js';
import { setupSkipToContent, transitionHelper, isServiceWorkerAvailable } from '../utils/index.js';
import {
  getAccessToken,
  getLogout,
  isGuestMode,
  hasGuestCreatedStory,
  endGuestSession,
} from '../utils/auth.js';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipButton;

  constructor({ navigationDrawer, drawerButton, content, skipButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipButton = skipButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const isGuest = isGuestMode();
    const hasCreatedStory = hasGuestCreatedStory();

    const navListMain = this.#navigationDrawer.children.namedItem('nav-list-main');
    const navList = this.#navigationDrawer.children.namedItem('nav-list');

    if (!isLogin && isGuest) {
      navListMain.innerHTML = generateMainGuestOnlyNavigationListTemplate();

      if (hasCreatedStory) {
        navList.innerHTML = generateGuestHasCreatedStoryNavigationListTemplate();
      } else {
        navList.innerHTML = generateGuestOnlyNavigationListTemplate();
      }

      this.#setupLogoutButton();
      return;
    }

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    this.#setupLogoutButton();
  }

  #setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');

    if (!logoutButton) return;

    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        if (isGuestMode()) {
          endGuestSession();
        } else {
          getLogout();
        }

        // Redirect
        location.hash = '/login';
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    if (typeof route !== 'function') {
      console.error('Route tidak ditemukan:', url);
      return;
    }

    const page = route();

    if (!page) {
      console.error('Page tidak ditemukan:', url);
      return;
    }

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        
        if (typeof page.afterRender === 'function') {
          await page.afterRender();
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'smooth' });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
