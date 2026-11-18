import NewPresenter from './new-presenter.js';
import { convertBase64ToBlob } from '../../utils/index.js';
import * as StoryAPI from '../../data/api.js';
import { generateLoadingTemplate } from '../../templates.js';
import Camera from '../../utils/camera.js';
import Map from '../../utils/map.js';

export default class NewPage {
  #presenter;
  #form;
  #camera;

  #isCameraOpen = false;
  #postStory = [];
  #map = null;

  #MAX_FILE_SIZE = 1 * 1024 * 1024;

  async render() {
    return `
            <article class="new-story-container">
              <section>
                  <div class="new-story_header">
                      <div class="container">
                          <h1 class="new-story_header__title">Buat Story Baru</h1>
                          <p class="new-story_header__description">
                              Silahkan lengkapi formulir di bawah untuk membuat story baru.
                          </p>
                      </div>
                  </div>
              </section>

              <section class="container">
                  <div class="new-form__container">
                      <form id="new-form" class="new-form" novalidate>
                          <div class="form-control">
                              <label for="photo-input" class="new-form__photo__title">Foto</label>
                              <p>Silahkan sertakan foto pilihan Anda.</p>
                              <div id="photo-more-info" class="validation-error"></div>

                              <div class="new-form__photo__container">
                                  <div class="new-form__photo__buttons">
                                      <button id="photo-input-button" class="btn btn-outline" type="button">
                                          Ambil Gambar
                                      </button>
                                      <input 
                                          id="photo-input"
                                          name="photo"
                                          type="file"
                                          accept="image/*"
                                          hidden="hidden"
                                          aria-describedby="photo-more-info"
                                      >
                                      <button id="open-photo-camera-button" class="btn btn-outline" type="button">
                                          Buka Kamera
                                      </button>
                                  </div>
                                  
                                  <div class="new-form__photo__output-container">
                                    <ul id="photo-taken-list" class="new-form__photo__output"></ul>
                                  </div>

                                  <div id="camera-container" class="new-form__camera__container">
                                      <video 
                                        id="camera-video" 
                                        class="new-form__camera__video"
                                      >
                                          Video stream not available.
                                      </video>
                                      <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>

                                      <div class="new-form__camera__tools">
                                          <select id="camera-select"></select>
                                          <div class="new-form__camera__tools-buttons">
                                              <button id="camera-take-button" class="btn btn-outline" type="button">
                                                  Ambil Foto
                                              </button>
                                          </div>
                                      </div>
                                  <div>
                              </div>
                          </div>

                          <div class="form-control">
                              <label for="description-input" class="new-form__description__title">Keterangan</label>

                              <div class="new-form__description__container">
                                  <textarea
                                      id="description-input"
                                      name="description"
                                      placeholder="Silahkan masukan keterangan story Anda..."
                                      aria-describedby="description-more-info"
                                      required
                                  ></textarea>
                              </div>

                              <div id="description-more-info" class="validation-error"></div>
                          </div>

                          <div class="form-control">
                              <div class="new-form__location__title">Lokasi</div>

                              <div class="new-form__location__container">
                                  <div class="new-form__location__map__container">
                                      <div id="map" class="new-form__location__map"></div>
                                      <div id="map-loading-container"></div>
                                  </div>
                                  
                                  <div class="new-form__location__lat-lng">
                                      <div class="new-form__location__lat">
                                          <label for="latitude">Latitude</label>
                                          <input id="latitude"type="number" name="lat" value="-6.175389">
                                      </div>

                                      <div class="new-form__location__lng">
                                          <label for="longitude">Longitude</label>
                                          <input id="longitude" type="number" name="lon" value="106.827139">
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="form-buttons">
                              <span id="submit-button-container">
                                  <button class="btn" type="submit">Upload Story</button>
                              </span>
                              <a class="btn btn-outline" href="#/">Batal</a>
                          </div>
                      </form>
                  </div>
              </section>
            </article>
          `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#postStory = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#validateForm()) return;

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#postStory[0]?.blob,
        lat: this.#form.elements.namedItem('lat').value,
        lon: this.#form.elements.namedItem('lon').value,
      };

      await this.#presenter.postNewStory(data);
    });

    this.#form.elements
      .namedItem('description')
      .addEventListener('input', () => this.#validateDescription());

    document.getElementById('photo-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
      this.#validatePhoto();
    });

    document.getElementById('photo-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('photo-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document.getElementById('open-photo-camera-button').addEventListener('click', async (event) => {
      cameraContainer.classList.toggle('open');
      this.#isCameraOpen = cameraContainer.classList.contains('open');

      if (this.#isCameraOpen) {
        event.currentTarget.textContent = 'Tutup Kamera';
        this.#setupCamera();
        await this.#camera.launch();

        return;
      }

      event.currentTarget.textContent = 'Buka Kamera';
      this.#camera.stop();
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();

    const lat = centerCoordinate.lat;
    const lon = centerCoordinate.lng;

    this.#updateLatLngInput(lat, lon);

    const draggableMarker = this.#map.addMarker([lat, lon], {
      draggable: true,
    });

    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);

      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(lat, lon) {
    this.#form.elements.namedItem('lat').value = lat;
    this.#form.elements.namedItem('lon').value = lon;
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();

      this.#validatePhoto();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };

    this.#postStory = [newPhoto];
  }

  async #populateTakenPictures() {
    const html = this.#postStory.reduce((accumulator, picture) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
                  <li class="new-form__photo__output-item">
                      <button type="button" data-deletepictureid="${picture.id}" class="new-form__photo__output-item__delete-btn">
                          <img src="${imageUrl}" alt="Foto Pilihan">
                      </button>
                  </li>
              `);
    }, '');

    document.getElementById('photo-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) => {
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        this.#populateTakenPictures();
        this.#validatePhoto();
      });
    });
  }

  #removePicture(id) {
    const selectedPicture = this.#postStory.find((picture) => {
      return picture.id == id;
    });

    if (!selectedPicture) {
      return null;
    }

    this.#postStory = this.#postStory.filter((picture) => {
      return picture.id !== selectedPicture.id;
    });

    return selectedPicture;
  }

  #validateForm() {
    const isPhotoValid = this.#validatePhoto();
    const isDescriptionValid = this.#validateDescription();

    const photoInput = this.#form.elements.namedItem('photo');
    const descriptionInput = this.#form.elements.namedItem('description');

    if (!isPhotoValid) {
      alert(photoInput.validationMessage);
    }

    if (!isDescriptionValid) {
      alert(descriptionInput.validationMessage);
    }

    return isPhotoValid && isDescriptionValid;
  }

  #validatePhoto() {
    const photoInfo = document.getElementById('photo-more-info');
    const photoInput = this.#form.elements.namedItem('photo');
    const photo = this.#postStory[0]?.blob;

    let errorMessage = '';

    if (!photo) {
      errorMessage = 'Foto wajib diunggah';
    } else if (!photo.type.startsWith('image/')) {
      errorMessage = 'File yang diunggah harus berupa gambar';
    } else if (photo.size > this.#MAX_FILE_SIZE) {
      errorMessage = 'Ukuran foto tidak boleh lebih dari 1 MB';
    }

    if (errorMessage) {
      photoInfo.textContent = errorMessage;
      photoInfo.classList.add('show');
      photoInput.setCustomValidity(errorMessage);

      return false;
    }

    photoInfo.classList.remove('show');
    photoInput.setCustomValidity('');

    return true;
  }

  #validateDescription() {
    const descInfo = document.getElementById('description-more-info');
    const desc = this.#form.elements.namedItem('description');
    const isDescEmpty = !desc.value.trim();

    if (isDescEmpty) {
      descInfo.classList.add('show');
      descInfo.textContent = 'Deskripsi wajib diisi';
      desc.setCustomValidity('Deskripsi wajib diisi');

      return false;
    }

    descInfo.classList.remove('show');
    desc.setCustomValidity('');

    return true;
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoadingTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
              <button class="btn" type="submit" disabled>
                  <i class="fas fa-spinner loader-button"></i> Upload Story
              </button>
          `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
              <button class="btn" type="submit">Upload Story</button>
          `;
  }

  storeSuccess(message, guestMode = false) {
    alert(message);
    this.clearForm();

    if (guestMode) {
      location.hash = '/';
      return;
    }

    // Redirect page
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }
}
