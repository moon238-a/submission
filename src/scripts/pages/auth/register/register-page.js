import RegisterPresenter from './register-presenter.js';
import * as StoryAPI from '../../../data/api.js';
import * as AuthModel from '../../../utils/auth.js';
import { startGuestSession } from '../../../utils/auth.js';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
            <article class="register-container">
                <section class="register-form-container">
                    <h1 class="register-title">Daftar Akun</h1>

                    <form id="register-form" class="register-form">
                        <div class="form-control">
                            <label for="name-input" class="register-form__name-title">Nama</label>

                            <div class="register-form__title-container">
                                <input 
                                  id="name-input" 
                                  type="text" 
                                  name="name" 
                                  placeholder="Masukan nama Anda"
                                  aria-describedby="name-more-info"
                                  required
                                >
                            </div>
                            <div id="name-more-info" class="validation-error"></div>
                        </div>

                        <div class="form-control">
                            <label for="email-input" class="register-form__email-title">Email</label>

                            <div class="register-form__title-container">
                                <input 
                                  id="email-input" 
                                  type="email" 
                                  name="email" 
                                  placeholder="Contoh: nama@email.com"
                                  aria-describedby="email-more-info"
                                  required
                                >
                            </div>
                            <div id="email-more-info" class="validation-error"></div>
                        </div>

                        <div class="form-control">
                            <label for="password-input" class="register-form__password-title">Password</label>

                            <div class="register-form__title-container">
                                <input 
                                  id="password-input" 
                                  type="password" 
                                  name="password" 
                                  minlength=8
                                  placeholder="Masukkan password Anda"
                                  aria-describedby="pass-more-info"
                                  required
                                >
                            </div>
                            <div id="pass-more-info" class="validation-error"></div>
                        </div>

                        <div class="form-buttons register-form__form-buttons">
                          <div id="register-error" class="validation-error"></div>
                            <div id="submit-button-container">
                                <button class="btn" type="submit">Daftar</button>
                            </div>
                            <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
                            <p class="register-form__guest-account">Masuk sebagai <a href="#/" id="guest-login">Tamu</a></p>
                        </div>
                    </form>
                </section>
            </article>
        `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
    this.#setupGuestLogin();
  }

  #setupForm() {
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const passInput = document.getElementById('password-input');

    nameInput.addEventListener('input', () => this.#validateName());
    emailInput.addEventListener('input', () => this.#validateEmail());
    passInput.addEventListener('input', () => this.#validatePassword());

    document.getElementById('register-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#validateForm()) return;

      const data = {
        name: document.getElementById('name-input').value,
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  #setupGuestLogin() {
    const guestLogin = document.getElementById('guest-login');

    guestLogin.addEventListener('click', () => {
      startGuestSession();
    });
  }

  #validateForm() {
    const isNameValid = this.#validateName();
    const isEmailValid = this.#validateEmail();
    const isPassValid = this.#validatePassword();

    return isEmailValid && isNameValid && isPassValid;
  }

  #validateEmail() {
    const emailInfo = document.getElementById('email-more-info');
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

  #validateName() {
    const nameInfo = document.getElementById('name-more-info');
    const nameInput = document.getElementById('name-input');

    if (!nameInput.value.trim()) {
      nameInfo.textContent = 'Nama wajib diisi';
      nameInfo.classList.add('show');
      nameInput.setCustomValidity('Nama wajib diisi');

      return false;
    }

    nameInfo.classList.remove('show');
    nameInput.setCustomValidity('');

    return true;
  }

  #validatePassword() {
    const passInfo = document.getElementById('pass-more-info');
    const passInput = document.getElementById('password-input');

    let errorMessage = '';

    if (!passInput.value.trim()) {
      errorMessage = 'Password wajib diisi';
    } else if (passInput.validity.tooShort) {
      errorMessage = 'Minimal panjang password harus 8 karakter';
    }

    if (errorMessage) {
      passInfo.textContent = errorMessage;
      passInfo.classList.add('show');
      passInput.setCustomValidity(errorMessage);

      return false;
    }

    passInfo.classList.remove('show');
    passInput.setCustomValidity('');

    return true;
  }

  registerSuccess(message) {
    console.log(message);

    location.hash = '/';
  }

  registerFailed(message) {
    const registerError = document.getElementById('register-error');

    registerError.textContent = message;
    registerError.classList.add('show');
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="fas fa-spinner loader-button"></i> Daftar
            </button>
        `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Daftar</button>
        `;
  }
}
