import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilderRoutingModule } from './form-builder-routing.module';
import { FormBuilderComponent } from './Component/form-builder.component';

@NgModule({
  declarations: [
    FormBuilderComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormBuilderRoutingModule
  ],
  exports: [
    FormBuilderComponent
  ]
})
export class FormBuilderModule { }
