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

  // Track the currently selected section for adding elements
  selectedSection: FormSection | null = null;

  // Flag to show/hide the element selection sidebar
  showElementSelection: boolean = false;

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
  addSection(): void {
    const newSection: FormSection = {
      title: 'New Section',
      canCollapsed: true,
      isCollapsed: false,
      elements: []
    };
    this.formData.component.push(newSection);
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

  // Show element selection sidebar for a specific section
  showElementSelectionSidebar(section: FormSection): void {
    this.selectedSection = section;
    this.showElementSelection = true;
    console.log('Element selection sidebar shown for section:', section.title);
  }

  // Hide element selection sidebar
  hideElementSelectionSidebar(): void {
    this.showElementSelection = false;
    this.selectedSection = null;
  }

  // Add a text field element to a section
  addTextFieldElement(): void {
    if (!this.selectedSection) return;

    const label = "Enter Your Label";
    const textFieldElement: FormComponent = {
      type: "text",
      attributes: {
        label: label,
        field_name: this.generateFieldName(label, this.selectedSection.title),
        is_required: false,
        placeholder_text: "Type your Placeholder",
        show_label: true,
        validations: {
          minlength: "3",
          maxlength: "12"
        },
        actions: {
          comment: true,
          camera: false,
          flag: false
        }
      }
    };
    this.selectedSection.elements.push(textFieldElement);
    console.log('Text field added to section:', this.selectedSection.title);
    this.hideElementSelectionSidebar();
  }

  // Generate field name based on label and section name
  generateFieldName(label: string, sectionTitle: string): string {
    // Remove special characters and spaces, convert to camelCase
    const cleanLabel = label.replace(/[^a-zA-Z0-9 ]/g, '');
    const cleanSection = sectionTitle.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/ /g, '_');
    // Combine section and label
    return cleanSection + '_' + cleanLabel.replace(/ /g, '_');
  }

  // Update field name when label changes
  updateFieldName(element: FormComponent, newLabel: string, sectionTitle: string): void {
    element.attributes.field_name = this.generateFieldName(newLabel, sectionTitle);
  }

  // Toggle required status
  toggleRequired(element: FormComponent): void {
    element.attributes.is_required = !element.attributes.is_required;
  }

  // Delete element from section
  deleteElement(section: FormSection, elementIndex: number): void {
    section.elements.splice(elementIndex, 1);
    console.log('Element deleted from section:', section.title);
  }

  // Add an email field element to a section
  addEmailFieldElement(): void {
    if (!this.selectedSection) return;

    const label = "Enter Your Label";
    const emailFieldElement: FormComponent = {
      type: "email",
      attributes: {
        label: label,
        field_name: this.generateFieldName(label, this.selectedSection.title),
        is_required: true,
        placeholder_text: "Enter your email",
        show_label: true,
        validations: {
           pattern: "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
        },
        actions: {
          comment: true,
          camera: false,
          flag: false
        }
      }
    };
    this.selectedSection.elements.push(emailFieldElement);
    console.log('Email field added to section:', this.selectedSection.title);
    console.log('Updated form data:', this.formData);
    this.hideElementSelectionSidebar();
  }

  // Add a number field element to a section
  addNumberFieldElement(): void {
    if (!this.selectedSection) return;

    const label = "Phone No.";
    const numberFieldElement: FormComponent = {
      type: "number",
      attributes: {
        label: label,
        field_name: this.generateFieldName(label, this.selectedSection.title),
        is_required: true,
        placeholder_text: "Enter a number",
        show_label: true,
        default_value: "+91",
        validations: {
          minlength: "10",
          maxlength: "13",
          pattern: "^(\\+91)?[0-9]{10}$"
        },
        actions: {
          comment: true,
          camera: false,
          flag: false
        }
      }
    };
    this.selectedSection.elements.push(numberFieldElement);
    console.log('Number field added to section:', this.selectedSection.title);
    this.hideElementSelectionSidebar();
  }
}
