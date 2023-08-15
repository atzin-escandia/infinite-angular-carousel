import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { InfiniteCarouselComponent } from './infinite-carousel/infinite-carousel.component';

@NgModule({
  declarations: [
    AppComponent,
    InfiniteCarouselComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
