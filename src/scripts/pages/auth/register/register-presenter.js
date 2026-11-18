export default class RegisterPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getRegistered({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getRegistered({ name, email, password });

      if (!response.ok) {
        console.error('getRegistered: response:', response);
        this.#view.registerFailed(response.message);
        return;
      }

      const loginResponse = await this.#model.getLogin({
        email,
        password,
      });

      if (!loginResponse.ok) {
        this.#view.registerFailed(
          'Registrasi berhasil, tetapi login otomatis gagal. Silakan login secara manual.',
        );
        return;
      }

      const isTokenSaved = this.#authModel.putAccessToken(loginResponse.loginResult.token);
      console.log('Token saved:', isTokenSaved);

      if (!isTokenSaved) {
        this.#view.registerFailed('Login berhasil, tetapi token gagal disimpan.');
        return;
      }

      this.#view.registerSuccess(response.message);
    } catch (error) {
      console.error('getRegistered: error:', error);
      this.#view.registerFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
