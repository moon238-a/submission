import {
  isGuestMode,
  getAccessToken,
  hasGuestCreatedStory,
  markGuestCreatedStory,
  saveGuestStory,
} from '../../utils/auth.js';

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, lat, lon }) {
    const guestMode = isGuestMode();

    if (!getAccessToken() && !guestMode) {
      this.#view.storeFailed('Silakan login terlebih dahulu.');
      return;
    }

    if (guestMode && hasGuestCreatedStory()) {
      this.#view.storeFailed('Pengguna tamu hanya dapat membuat satu story.');
      return;
    }

    this.#view.showSubmitLoadingButton();
    try {
      let previousStoryIds = new Set();

      if (!guestMode) {
        const beforeResponse = await this.#model.getAllStory();

        if (!beforeResponse.ok) {
          throw new Error(beforeResponse.message);
        }

        previousStoryIds = new Set(
          (beforeResponse.listStory || []).map((story) => story.id)
        );
      }

      const data = {
        description: description,
        photo: photo,
        lat: lat,
        lon: lon,
      };

      const response = guestMode
        ? await this.#model.addNewStoryGuest(data)
        : await this.#model.addNewStory(data);

      console.log('Upload response:', response);

      if (!response.ok) {
        console.error('postNewStory: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      if (guestMode) {
        saveGuestStory({
          id: `guest-${Date.now()}`,
          name: 'Guest',
          description,
          photoUrl: URL.createObjectURL(photo),
          createdAt: new Date().toISOString(),
          lat,
          lon,
        });

        markGuestCreatedStory();
      } else {
        const afterResponse = await this.#model.getAllStory();

        if (!afterResponse.ok) {
          throw new Error(afterResponse.message);
        }

        console.log('Story sebelum upload:', [...previousStoryIds]);
        console.log('Story setelah upload:', afterResponse.listStory);

        const newStory = afterResponse.listStory.find((story) => !previousStoryIds.has(story.id));

        console.log('Story baru ditemukan:', newStory);
        console.log('ID story untuk notifikasi:', newStory?.id);
        
        if (newStory) {
          console.log({
            title: 'Story berhasil dibuat',
            body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
            data: {
              id: newStory.id,
            },
          });
        } else {
          console.warn('ID story baru tidak ditemukan.');
        }
      }

      this.#view.storeSuccess(response.message);
    } catch (error) {
      console.error('postNewStory: error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
