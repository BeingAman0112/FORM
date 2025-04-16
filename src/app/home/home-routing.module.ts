import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Component/home.component';
import { FormsComponent } from './Component/forms.component';

const routes: Routes = [
  {
    path: '',
    component: FormsComponent
  },
  {
    path: 'Form',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
