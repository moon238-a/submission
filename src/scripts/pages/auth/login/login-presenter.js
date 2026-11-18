export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      console.log('Login response:', {
        ...response,
        loginResult: {
          ...response.loginResult,
          token: '[REDACTED]',
        },
      });

      const isTokenSaved = this.#authModel.putAccessToken(response.loginResult.token);
      console.log('Token saved:', isTokenSaved);

      this.#view.loginSuccess(response.message, response.loginResult);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
