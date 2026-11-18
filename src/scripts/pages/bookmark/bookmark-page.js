import { 
  generateLoadingTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate
} from "../../templates.js";
import BookmarkPresenter from "./bookmark-presenter.js";
import Database from "../../data/database.js";
import Map from "../../utils/map.js";

export default class BookmarkPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <article class="bookmark-container">
        <section>
          <div class="stories-list__map__container">
            <div id="map" class="stories-list__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </section>
 
        <section class="container">
          <h1 class="section-title">Bookmark Page</h1>
 
          <div class="stories-list__container">
            <div id="stories-list" class="stories-list"></div>
            <div id="stories-list-loading-container"></div>
          </div>
        </section>
      </article>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.showBookmarkedStoryList();
  }

  async populateBookmarkedStoryListAndInitialMap(message, stories) {
    if (stories.length <= 0) {
      this.populateBookmarkedStoriesListEmpty();
      return;
    }

    await this.#presenter.showBookmarkedStoryListMap();

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

  populateBookmarkedStoriesListEmpty() {
    document.getElementById('stories-list').innerHTML = generateStoriesListEmptyTemplate();
  }

  populateBookmarkedStoryListError(message) {
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
