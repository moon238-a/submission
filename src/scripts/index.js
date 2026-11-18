// CSS imports
import '../styles/styles.css';
import '../styles/responsive.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app.js';
import Camera from './utils/camera.js';
import { registerServiceWorker } from './utils/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    skipButton: document.querySelector('#skip-link'),
  });
  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    Camera.stopAllStream();
  });
});
