import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { MapComponent } from '../map/map.component';
import { HomeComponent } from './Component/home.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { GroupedDropdownComponent } from './Component/GrpDropDown.Component';
import { FormsComponent } from './Component/forms.component';


@NgModule({
  declarations: [
    MapComponent,
    HomeComponent,
    FormsComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    GroupedDropdownComponent
  ]
})
export class HomeModule { }
