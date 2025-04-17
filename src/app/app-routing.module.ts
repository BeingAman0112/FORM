import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
  path: 'home',
  loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'buildForm',
    loadChildren: () => import('./form-builder/form-builder.module').then(m => m.FormBuilderModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
