import LoginPresenter from './login-presenter.js';
import * as StoryAPI from '../../../data/api.js';
import * as AuthModel from '../../../utils/auth.js';
import { startGuestSession } from '../../../utils/auth.js';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
            <article class="login-container">
                <section class="login-form-container">
                    <h1 class="login-title">Masuk Akun</h1>

                    <form id="login-form" class="login-form">
                        <div class="form-control">
                            <label for="email-input" class="login-form__email-title">Email</label>

                            <div class="login-form__title-container">
                                <input 
                                  id="email-input" 
                                  type="email" 
                                  name="email" 
                                  placeholder="Contoh: nama@email.com"
                                  aria-describedby="login-email-more-info"
                                  required
                                >
                            </div>
                            <div id="login-email-more-info" class="validation-error"></div>
                        </div>

                        <div class="form-control">
                            <label for="password-input" class="login-form__password-title">Password</label>

                            <div class="login-form__title-container">
                                <input 
                                  id="password-input" 
                                  type="password" 
                                  name="password"
                                  minlength=8 
                                  placeholder="Masukkan password Anda"
                                  aria-describedby="login-pass-more-info"
                                  required
                                >
                            </div>
                            <div id="login-pass-more-info" class="validation-error"></div>
                        </div>

                        <div class="form-buttons login-form__form-buttons">
                          <div id="login-error" class="validation-error"></div>
                            <div id="submit-button-container">
                                <button class="btn" type="submit">Masuk</button>
                            </div>
                            <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
                            <p class="login-form__guest-account">Masuk sebagai <a href="#/" id="guest-login">Tamu</a></p>
                        </div>
                    </form>
                </section>
            </article>
        `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
    this.#setupGuestLogin();
  }

  #setupForm() {
    const emailInput = document.getElementById('email-input');
    const passInput = document.getElementById('password-input');

    emailInput.addEventListener('input', () => this.#validateEmail());
    passInput.addEventListener('input', () => this.#validatePassword());

    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#validateForm()) return;

      const data = {
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };
      await this.#presenter.getLogin(data);
    });
  }

  #setupGuestLogin() {
    const guestLogin = document.getElementById('guest-login');

    guestLogin.addEventListener('click', () => {
      startGuestSession();
    });
  }

  #validateForm() {
    const isEmailValid = this.#validateEmail();
    const isPassValid = this.#validatePassword();

    return isEmailValid && isPassValid;
  }

  #validateEmail() {
    const emailInfo = document.getElementById('login-email-more-info');
    const emailInput = document.getElementById('email-input');

    let errorMessage = '';

    if (!emailInput.value.trim()) {
      errorMessage = 'Email wajib diisi';
    } else if (emailInput.validity.typeMismatch) {
      errorMessage = 'Format email tidak valid';
    }

    if (errorMessage) {
      emailInfo.textContent = errorMessage;
      emailInfo.classList.add('show');
      emailInput.setCustomValidity(errorMessage);

      return false;
    }

    emailInfo.classList.remove('show');
    emailInput.setCustomValidity('');

    return true;
  }

  #validatePassword() {
    const passInfo = document.getElementById('login-pass-more-info');
    const passInput = document.getElementById('password-input');

    let errorMessage = '';

    if (!passInput.value.trim()) {
      errorMessage = 'Password wajib diisi';
    } else if (passInput.validity.tooShort) {
      errorMessage = 'Minimal panjang password harus 8 karakter';
    }

    if (errorMessage) {
      passInfo.classList.add('show');
      passInfo.textContent = errorMessage;
      passInput.setCustomValidity(errorMessage);

      return false;
    }

    passInfo.classList.remove('show');
    passInput.setCustomValidity('');

    return true;
  }

  loginSuccess(message) {
    console.log(message);

    location.hash = '/';
  }

  loginFailed(message) {
    const loginError = document.getElementById('login-error');

    loginError.textContent = message;
    loginError.classList.add('show');
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="fas fa-spinner loader-button"></i> Masuk
            </button>
        `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Masuk</button>
        `;
  }
}
