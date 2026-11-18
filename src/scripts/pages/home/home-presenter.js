import { storyMapper } from '../../data/api-mapper.js';
import { isGuestMode, getGuestStories } from '../../utils/auth.js';

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoryListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryList() {
    this.#view.showLoading();
    try {
      if (isGuestMode()) {
        const stories = getGuestStories();

        this.#view.populateStoryListAndInitialMap(stories);
        return;
      }
      const response = await this.#model.getAllStory();

      if (!response.ok) {
        console.error('showStoryList: response:', response);
        this.#view.populateStoryListError(response.message);
        return;
      }

      const stories = await Promise.all(response.listStory.map((story) => storyMapper(story)));
      console.log(stories);

      this.#view.populateStoryListAndInitialMap(stories);
    } catch (error) {
      console.error('showStoryList: error:', error);
      this.#view.populateStoryListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
