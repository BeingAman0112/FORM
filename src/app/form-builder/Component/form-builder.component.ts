import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreDataService } from '../../core-data.service';
import { FormJson, FormSection, FormComponent } from '../../home/Model/model';

@Component({
  selector: 'app-form-builder',
  templateUrl: './../Template/form-builder.component.html',
  styleUrl: './../Styles/form-builder.component.css'
})
export class FormBuilderComponent implements OnInit {
  // Form builder form
  formBuilderForm: FormGroup;

  // Form data
  formData: FormJson = {
    formName: 'New Form',
    userName: 'Current User',
    createdBy: 'Current User',
    component: []
  };

  // Create form modal
  showCreateFormModal: boolean = false;
  createFormForm: FormGroup;

  constructor(
    private coreDataService: CoreDataService,
    private fb: FormBuilder
  ) {
    this.formBuilderForm = this.fb.group({
      formName: ['New Form', Validators.required],
      userName: ['Current User', Validators.required],
      createdBy: ['Current User', Validators.required]
    });

    this.createFormForm = this.fb.group({
      formName: ['Form', Validators.required],
      userName: ['User', Validators.required],
      createdBy: ['admin01', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialize with one empty section
    // this.addSection();

    // Subscribe to form value changes
    this.formBuilderForm.valueChanges.subscribe(values => {
      this.updateFormData(values);
    });
  }

  // Create a new form
  createNewForm(): void {
    const formValues = this.createFormForm.value;

    this.formData = {
      formName: formValues.formName,
      userName: formValues.userName,
      createdBy: formValues.createdBy,
      component: []
    };
    this.formBuilderForm.patchValue({
      formName: formValues.formName,
      userName: formValues.userName,
      createdBy: formValues.createdBy
    });

    // Add an initial section
    this.addSection();

    // Close the Form pop-up
    this.showCreateFormModal = false;

    console.log('New form created:', this.formData);
  }
  // Update form data when form values change
  updateFormData(values: any): void {
    this.formData.formName = values.formName;
    this.formData.userName = values.userName;
    this.formData.createdBy = values.createdBy;
    console.log('Form data updated:', this.formData);
  }


  // New section
  newSection: FormSection = {
    title: 'New Section',
    canCollapsed: true,
    isCollapsed: false,
    elements: []
  };
  addSection(): void {
    this.formData.component.push(this.newSection);
  }
  updateSectionTitle(section: FormSection, newTitle: string): void {
    section.title = newTitle;
  }










  // Save the form
  saveForm(): void {
    console.log(JSON.stringify(this.formData, null, 2));

    // Here you would typically send the form data to your backend
    // this.coreDataService.saveForm(this.formData).subscribe(response => {
    //   console.log('Form saved successfully', response);
    // });
  }
}
