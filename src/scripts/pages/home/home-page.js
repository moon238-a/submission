import {
  generateLoadingTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from '../../templates.js';
import HomePresenter from './home-presenter.js';
import Map from '../../utils/map.js';
import * as StoryAPI from '../../data/api.js';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <article class="home-container">
        <section>
          <div class="stories-list__map__container">
            <div id="map" class="stories-list__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </section>

        <section class="container">
          <h1 class="section-title">Home Page</h1>

          <div class="stories-list__container">
            <div id="stories-list" class="stories-list"></div>
            <div id="stories-list-loading-container"></div>
          </div>
        </section>
      </article>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.showStoryList();
  }

  async populateStoryListAndInitialMap(stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    await this.#presenter.showStoryListMap();

    const html = stories.reduce((accumulator, story) => {
      if (this.#map) {
        if (story.lat !== null && story.lon !== null) {
          const coordinate = [story.lat, story.lon];
          const markerOptions = { alt: story.name };
          const popupOptions = { content: story.name };

          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        }
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          ...story,
        }),
      );
    }, '');

    document.getElementById('stories-list').innerHTML = html;
  }

  populateStoriesListEmpty() {
    document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoryListError(message) {
    document.getElementById('stories-list').innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 5,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoadingTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = generateLoadingTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }
}
