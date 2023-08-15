import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewRouteComponent } from './view-route.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ViewRouteComponent],
  exports: [ViewRouteComponent],
  imports: [CommonModule, RouterModule],
})
export class ViewRouteModule {}
