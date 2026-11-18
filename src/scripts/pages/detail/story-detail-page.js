import {
  generateLoadingTemplate,
  generateStoryDetailTemplate,
  generateStoryDetailErrorTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from '../../templates.js';
import StoryDetailPresenter from './story-detail-presenter.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import * as StoryAPI from '../../data/api.js';
import Database from '../../data/database.js';
import Map from '../../utils/map.js';

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
            <div class="story-detail-page">
                <div class="story-detail__backdrop"></div>
                <article class="story-detail__container">
                    <div class="container">
                        <div id="story-detail" class="story-detail"></div>
                        <div id ="story-detail-loading-container"></div>
                    </div>
                </article>
            </div>
        `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: StoryAPI,
      dbModel: Database,
      storyId: parseActivePathname().id,
    });

    this.#presenter.showStoryDetail();
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
    });
  }

  async populateStoryDetailAndInitialMap({ story, hasPrevious, hasNext }) {
    const hasLocation = story.lat != null && story.lon != null;

    document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      location: story.location,
      lat: story.lat,
      lon: story.lon,
      hasPrevious,
      hasNext,
    });

    this.#presenter.showSaveButton();

    this.#setupStoryActions();

    if (hasLocation) {
      await this.#presenter.showStoryDetailMap();

      if (this.#map) {
        const storyCoordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#map.changeCamera(storyCoordinate);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    }
  }

  #setupStoryActions() {
    const previousButton = document.getElementById('previous-story');
    const nextButton = document.getElementById('next-story');

    previousButton.addEventListener('click', () => {
      this.#presenter.previousStory();
    });

    nextButton.addEventListener('click', () => {
      this.#presenter.nextStory();
    });
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML = generateSaveStoryButtonTemplate();

    document.getElementById('story-detail-save').addEventListener('click', async () => {
      await this.#presenter.saveStory();
      await this.#presenter.showSaveButton();
    });
  }

  saveToBookmarkSuccess(message) {
    alert(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateRemoveStoryButtonTemplate();

    document.getElementById('story-detail-remove').addEventListener('click', async () => {
      await this.#presenter.removeStory();
      await this.#presenter.showSaveButton();
    });
  }

  removeFromBookmarkSuccess(message) {
    alert(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }

  populateStoryDetailError(message) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailErrorTemplate(message);
  }

  showLoading() {
    document.getElementById('story-detail-loading-container').innerHTML = generateLoadingTemplate();
  }

  hideLoading() {
    document.getElementById('story-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoadingTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}
