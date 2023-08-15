# Infinite Angular Carousel :cyclone:

An **infinite carousel** built using Angular that allows you to showcase a collection of items in a continuous loop. 🎉

## Features :sparkles:

- **Infinite Looping:** Items seamlessly loop back when reaching the end of the carousel, providing a continuous browsing experience.

- **Responsive Design:** The carousel is designed to adapt gracefully to different screen sizes, ensuring optimal viewing on various devices.

- **Customizable:** Easily configure the carousel's appearance, behavior, and content to suit your needs.

## Desktop :desktop_computer:

![Alt text](image-1.png)

## Mobile :iphone:

![Alt text](image.png)

## Installation :computer:

1. Clone this repository:

   ```bash
   git clone https://github.com/atzin-escandia/infinite-angular-carousel.git
   ```

2. Navigate to the project directory:

   ```bash
   cd infinite-angular-carousel
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   ng serve
   ```

5. Open your browser and go to `http://localhost:4200` to see the infinite carousel in action!

## Usage :rocket:

1. Define the Infinite Carousel content from your declaration component:

   ```typescript
   slides: any = [
     {
       title: "Descubre nuestra línea de productos de cuidado de la piel",
       buttonName: "Ver productos",
       image: "https://images.unsplash.com/photo-1555820585-c5ae44394b79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=725&q=80",
       position: 1,
     },
     {
       title: "Consejos para un maquillaje natural y resplandeciente",
       buttonName: "Ver consejos",
       image: "https://images.unsplash.com/photo-1508759073847-9ca702cec7d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
       position: 2,
     },
     {
       title: "Los secretos de un cabello sano y brillante",
       buttonName: "Ver secretos",
       image: "https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
       position: 3,
     },
   ];
   ```

2. Use the `infinite-carousel` component in your template:

   ```html
   <app-infinite-carousel [slides]="slides"></app-infinite-carousel>
   ```

3. Provide an array of `carouselItems` to showcase in the carousel. Each item should have a unique identifier, a title, an image, etc.

---

## Contributing :hammer_and_wrench:

Contributions are welcome! If you find a bug or have an idea for an enhancement, please open an issue or submit a pull request.

Love this carousel? 🌱 &nbsp;
<a href="https://github.com/atzin-escandia" target="_blank" rel="noopener">
Give my repo a star.✨
</a>
