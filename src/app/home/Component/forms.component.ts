import { Component, OnInit } from '@angular/core';
import { CoreDataService } from '../../core-data.service';
import { FormJson } from '../Model/model';

@Component({
  selector: 'app-forms',
  templateUrl: './../Template/Forms.component.html',
  styleUrl: './../Style/forms-component.css'
})
export class FormsComponent implements OnInit {
  formsList: FormJson[] = [];
  selectedFormId: string | null = null;
  isSidebarCollapsed: boolean = false;

  constructor(private coreDataService: CoreDataService) {}

  ngOnInit() {
    this.loadForms();
  }

  loadForms() {
    this.coreDataService.getAllforms().subscribe({
      next: (data) => {
        this.formsList = data;
        if (this.formsList.length > 0) {
          // Select the first form by default
          console.log("Emplty FormsList");
          // this.selectForm(this.formsList[0]);
        }
      },
      error: (err) => {
        console.error('Error loading forms:', err);
      }
    });
  }

  selectForm(form: any) {
    if (form && form.id) {
      this.selectedFormId = form.id;
      // console.log('Selected form:', form);
    } else {
      console.error('Invalid form object or missing id:', form);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
