import { storyMapper } from '../../data/api-mapper.js';

export default class StoryDetailPresenter {
  #view;
  #model;
  #storyId;
  #dbModel;

  #stories = [];
  #currentIndex = -1;

  constructor({ view, model, dbModel, storyId }) {
    this.#view = view;
    this.#model = model;
    this.#storyId = storyId;
    this.#dbModel = dbModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showLoading();
    try {
      let story;

      try{
        const response = await this.#model.detailStory(this.#storyId);

        if (!response.ok || !response.story) {
          throw new Error(response.message || 'Gagal mengambil story dari API.');
        }

        story = await storyMapper(response.story);
        console.log(story);
      } catch (apiError) {
        console.warn('Gagal mengambil story dari API:', apiError);

        const savedStory = await this.#dbModel.getStoryById(this.#storyId);

        if (!savedStory) {
          throw apiError;
        }

        console.log('Story diambil dari IndexedDB:', savedStory);

        story = savedStory;
      }
        
      try {
          const storiesResponse = await this.#model.getAllStory();

          if (storiesResponse.ok) {
            this.#stories = storiesResponse.listStory;

            this.#currentIndex = this.#stories.findIndex((item) => item.id === this.#storyId);
          }
        } catch (error) {
          console.error('Failed to load story navigation:', error);
        }

        this.#view.populateStoryDetailAndInitialMap({
          story,
          hasPrevious: this.#currentIndex > 0,
          hasNext: this.#currentIndex >= 0 && this.#currentIndex < this.#stories.length - 1,
        });
      
      
    } catch (error) {
      console.error('showStoryDetail: error:', error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveStory() {
    try {
      const response = await this.#model.detailStory(this.#storyId);

      if (!response.ok || !response.story) {
        throw new Error(response.message || 'Gagal mengambil story.');
      }

      const story = await storyMapper(response.story);

      console.log('Story yang akan disimpan:', story);

      await this.#dbModel.putStory(story);
      this.#view.saveToBookmarkSuccess('Success to save to bookmark');
    } catch (error) {
      console.error('saveStory: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.removeFromBookmarkSuccess('Success to remove from bookmark');
    } catch (error) {
      console.error('removeStory: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }

  previousStory() {
    if (this.#currentIndex <= 0) return;

    const previousStory = this.#stories[this.#currentIndex - 1];

    location.hash = `#/stories/${previousStory.id}`;
  }

  nextStory() {
    if (this.#currentIndex < 0 || this.#currentIndex >= this.#stories.length - 1) return;

    const nextStory = this.#stories[this.#currentIndex + 1];

    location.hash = `#/stories/${nextStory.id}`;
  }
}
