import { showFormattedDate } from './utils/index.js';

export function generateLoadingTemplate() {
  return `
        <div class="loader loading"></div>
    `;
}

export function generateMainGuestOnlyNavigationListTemplate() {
  return `
        <li><a id="home-button" class="home-button" href="#/">Home</a></li>
    `;
}

export function generateGuestOnlyNavigationListTemplate() {
  return `
        <li><a id="new-story-button" class="btn new-story-button" href="#/new" aria-disabled="false">Buat Story Baru <i class="fas fa-plus"></i></a></li>
        <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
    `;
}

export function generateGuestHasCreatedStoryNavigationListTemplate() {
  return `
        <li><a id="new-story-button" class="btn new-story-button" href="#/" aria-disabled="true">Batas Story Tercapai <i class="fas fa-lock"></i></a></li>
        <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
        <li id="push-notification-tools" class="push-notification-tools"></li>
        <li><a id="new-story-button" class="btn new-story-button" href="#/new">Buat Story Baru <i class="fas fa-plus"></i></a></li>
        <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}

export function generateMainNavigationListTemplate() {
  return `
        <li><a id="home-button" class="home-button" href="#/">Home</a></li>
        <li><a id="bookmark-button" href="#/bookmark">Bookmark</a></li>
        <li><a id="about-button" class="bookmark-button" href="#/about">About</a></li>
    `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
        <li><a id="login-button" href="#/login">Login</a></li>
        <li><a id="register-button" href="#/register">Register</a></li>
    `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  location,
}) {
  return `
        <a href="#/stories/${id}" class="story-item" data-storyid="${id}">
            <div class="story-item__title-container">
                <h2 class="story-item__name">${name}</h2>
                <hr>
                <img class="story-item__image" src="${photoUrl}" alt="Foto Story dari ${name}">
            </div>
            <div class="story-item__body">
                <div class="story-item__more-info">
                    <div class="story-item__createdat">
                        <i class="fas fa-calendar-alt"></i>${showFormattedDate(createdAt, 'id-ID')}
                    </div>
                    <div class="story-item__location">
                        <i class="fas fa-map"></i>${location ?? 'Lokasi tidak tersedia'}
                    </div>
                </div>
                
                <div class="story-item__description">
                    <p>${description}</p>
                </div>
            </div>
        </a>
    `;
}

export function generateStoriesListEmptyTemplate() {
  return `
        <div id="stories-list-empty" class="stories-list__empty">
            <h2>Tidak ada <i>story</i> yang tersedia</h2>
            <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
        </div>
    `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
        <div id="stories-list-error" class="stories-list__error">
            <h2>Terjadi kesalahan pengambilan <i>stories</i></h2>
            <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
    `;
}

export function generateSubscribeButtonTemplate() {
  return `
        <button id="subscribe-button" class="btn subscribe-button">
            Subscribe <i class="fas fa-bell"></i>
        </button>
    `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
        <button id="unsubscribe-button" class="btn unsubscribe-button">
            Unsubscribe <i class="fas fa-bell-slash"></i>
        </button>
    `;
}

export function generateStoryDetailTemplate({
  name,
  description,
  photoUrl,
  createdAt,
  location,
  lat,
  lon,
  hasPrevious = false,
  hasNext = false,
}) {
  const hasLocation = lat != null && lon != null;

  return `
        <div class="story-detail__title-container">

            <div class="story-detail__title-actions__container">
                <a id="back-home" class="story-detail__back" href="#/">
                    <i class="fas fa-arrow-left"></i> Kembali
                </a>
                <div id="save-actions-container"></div>
            </div>

            <hr>

            <div class="story-detail__image__container">
                <img class="story-detail__image" src="${photoUrl}" alt="Foto Story dari ${name}">
            </div>
            <h1 id="story-detail-title" class="story-detail__name">${name}</h1>

            <div class="story-detail__more-info">
                <div class="story-detail__createdat">
                    <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
                </div>
                <div class="story-detail__location">
                    <i class="fas fa-map"></i> ${location ?? 'Lokasi tidak tersedia'}
                </div>
                
                <div class="story-detail__location__inline">
                    <div id="location-lat" class="story-detail__location__lat" data-value="${hasLocation ? lat : '-'}">Latitude: ${hasLocation ? lat : '-'}</div>
                    <div id="location-lon" class="story-detail__location__lon" data-value="${hasLocation ? lon : '-'}">Longitude: ${hasLocation ? lon : '-'}</div>
                </div>
                
            </div>
        </div>

        <hr>

        <div class="story-detail__body">
            <div class="story-detail__description-container">
                <h2 class="story-detail__description-title">Deskripsi</h2>
                <p id="story-detail-description" class="story-detail__description">
                    ${description}
                </p>
            </div>

            
            <div class="story-detail__map__container">
                <h2 class="story-detail__map__title">Peta Lokasi</h2>
                ${
                  hasLocation
                    ? `
                    <div class="story-detail__map__container">
                        <div id="map" class="story-detail__map"></div>
                        <div id="map-loading-container"></div>
                    </div>
                `
                    : '<p><strong>Lokasi story tidak tersedia.</strong></p>'
                }
            </div>
            
            <hr>

            <div class="story-detail__actions__container">
                <button 
                    id="previous-story" 
                    class="btn btn-outline"
                    type="button"
                    ${hasPrevious ? '' : 'disabled'}
                >
                    <i class="fas fa-arrow-left"></i> Previous
                </button>
                <button 
                    id="next-story" 
                    class="btn btn-outline"
                    type="button"
                    ${hasNext ? '' : 'disabled'}
                >
                    Next <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
        <div id="stories-detail-error" class="stories-detail__error">
            <h2>Terjadi kesalahan pengambilan <i>stories</i></h2>
            <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
    `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      <i class="fas fa-bookmark"></i>
    </button>
  `;
}
