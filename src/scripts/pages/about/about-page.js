export default class AboutPage {
  async render() {
    return `
      <article class="about-container">
        <section id="about" class="container">
          <h1>About Page</h1>
          <p>Coming soon! :D</p>

          <p>Bonus kotak animasi</p>
          <br/>
          <div class="box-container">
            <div class="box1"></div>
            <div class="box2"></div>
          </div>
        </section>
      </article>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
