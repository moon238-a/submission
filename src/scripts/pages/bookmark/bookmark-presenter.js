import { storyMapper } from "../../data/api-mapper";

export default class BookmarkPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async showBookmarkedStoryListMap() {
        this.#view.showMapLoading();
        try {
            await this.#view.initialMap();
        } catch (error) {
            console.error('showBookmarkedStoryListMap: error:', error);
        } finally {
            this.#view.hideMapLoading();
        }
    }

    async showBookmarkedStoryList() {
        this.#view.showLoading();
        try {
            const listOfStories = await this.#model.getAllStories();
            const stories = await Promise.all(listOfStories.map((story) => storyMapper(story)));
            console.log(stories);

            const message = 'Berhasil mendapatkan daftar story tersimpan.';
            await this.#view.populateBookmarkedStoryListAndInitialMap(message, stories);
        } catch (error) {
            console.error('showBookmarkedStoryList: error:', error);
            this.#view.populateBookmarkedStoryListError(error.message);
        } finally {
            this.#view.hideLoading();
        }
    }
}