import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import SignaturePad from 'signature_pad';
import { FormComponent, FormJson, FormSection } from '../Model/model';
import { CoreDataService } from '../../core-data.service';




@Component({
  selector: 'app-home',
  templateUrl: '../Template/home.component.html',
  styleUrl: '../Style/home.component.css'
})
export class HomeComponent implements OnChanges {
  @Input() formId: string = '';
  @ViewChild('signaturePad', { static: false }) signaturePadElement!: ElementRef;
  visibleComments: { [key: string]: boolean } = {};
  private signaturePad!: SignaturePad;
  signatureColor: string = 'black';
  signaturePadOptions = {
    minWidth: 1,
    canvasWidth: 400,
    canvasHeight: 150
  };
  formGroup : FormGroup;
  constructor(private fb: FormBuilder, protected coreDataService: CoreDataService) {
    this.formGroup = this.fb.group({
      skills: [[]],
    });

  }
  uploadedImages: { [key: string]: string | ArrayBuffer | null } = {};
  demo2!:FormJson;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formId'] && changes['formId'].currentValue) {
      this.loadForm(changes['formId'].currentValue);
    }
  }

  ngOnInit() {
    // If formId is provided on init, load that form
    if (this.formId) {
      this.loadForm(this.formId);
    } else {
      // Otherwise load the default form
      this.loadForm("67ff472eb05c197ee80cf831");
    }
  }

  loadForm(id: string) {
    // Reset form state before loading new form
    this.resetForm();

    this.coreDataService.getFormByID(id).subscribe({
      next: (data: any) => {
        this.demo2 = data;
        console.log('Loaded form:', this.demo2);
        this.buildForm();
      },
      error: (err) => {
        console.error('Error loading form:', err);
      }
    });
  }

  resetForm() {
    // Reset form state
    this.visibleComments = {};
    if (this.formGroup) {
      this.formGroup = this.fb.group({
        skills: [[]]
      });
    }
  }

  ngAfterViewInit() {
    this.initializeSignaturePad();
  }

  initializeSignaturePad() {
    setTimeout(() => {
      if (this.signaturePadElement && this.signaturePadElement.nativeElement) {
        // Clear any existing signature pad
        if (this.signaturePad) {
          this.signaturePad.clear();
        }

        // Initialize the signature pad with proper settings
        this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement, {
          penColor: this.signatureColor,
          backgroundColor: 'white',
          minWidth: 1,
          maxWidth: 3
        });

        console.log('Signature pad initialized');
      } else {
        console.log('Signature pad element not found');
      }
    }, 100); // Short delay to ensure the DOM is ready
  }
  changePenColor(event: any) {
    this.signatureColor = event.target.value;
    this.signaturePad.penColor = this.signatureColor;  // Change pen color dynamically
  }
  clearSignature() {
    this.signaturePad.clear();
  }

  saveSignature() {
    if (this.signaturePad && !this.signaturePad.isEmpty()) {
      const signatureDataUrl = this.signaturePad.toDataURL();
      console.log("Signature Saved");
      this.formGroup.get('signature')?.setValue(signatureDataUrl);
    } else {
      console.log("Signature pad is empty");
      alert('Please sign before saving.');
    }
  }

  signaturePads: { [key: string]: SignaturePad } = {}; // Store signature pads dynamically
  // Formly configuration for the form fields

  fileValidator(validations: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file) return null;

      if (!(file instanceof File)) return { invalidFileType: "Not a valid file" };

      const allowedExtensions = new RegExp(validations?.pattern || "\\.(jpg|jpeg|png)$", "i");
      if (!allowedExtensions.test(file.name)) {
        return { invalidFileType: "Invalid file format! Only JPG, JPEG, and PNG are allowed." };
      }

      if (validations?.maxSize && file.size / 1024 / 1024 > validations.maxSize) {
        return { fileTooLarge: `File size must be less than ${validations.maxSize} MB.` };
      }

      return null;
    };
  }


  dateValidator(validations:any): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      const today = new Date();

      if (validations.noPast && selectedDate < today) {
        return { pastDate: 'Date cannot be in the past' };
      }

      if (validations.noFuture && selectedDate > today) {
        return { futureDate: 'Date cannot be in the future' };
      }

      if (validations.minDate && selectedDate < new Date(validations.minDate)) {
        return { minDate: `Date must be after ${validations.minDate}` };
      }

      if (validations.maxDate && selectedDate > new Date(validations.maxDate)) {
        return { maxDate: `Date must be before ${validations.maxDate}` };
      }

      return null;
    };
  }

  locationName = '';
  updateLocation(location: { lat: number; lng: number }, field: string) {

    // this.service.getLocationName(location.lat, location.lng).subscribe({
    //   next: (location) => this.locationName = location,
    //   error: (err) => console.error(err)
    // });
    this.formGroup.get(field)?.setValue(JSON.stringify(location));
    this.formGroup.get(field)?.markAsTouched();
  }
  buildForm() {
    // this.formGroup = this.fb.group({}); // Reset form group before building
    this.demo2.component.forEach((section:FormSection) => {
      section.elements.forEach((component:FormComponent) => {
        let validatorsToAdd: ValidatorFn[] = [];
        const validations = component.attributes.validations || {};

        if (component.attributes.is_required) {
          validatorsToAdd.push(Validators.required);
        }

        // Add minLength & maxLength
        if (validations.minlength) {
          validatorsToAdd.push(Validators.minLength(validations.minlength));
        }
        if (validations.maxlength) {
          validatorsToAdd.push(Validators.maxLength(validations.maxlength));
        }

        // Pattern (skip for file)
        if (validations.pattern && component.type !== 'file') {
          validatorsToAdd.push(Validators.pattern(validations.pattern));
        }

        // Date validations
        if (validations.minDate || validations.maxDate || validations.noFuture || validations.noPast) {
          validatorsToAdd.push(this.dateValidator(validations));
        }

        // File validations
        if (component.type === 'file') {
          validatorsToAdd.push(this.fileValidator(validations));
        }

        // Default value
        let defaultValue: any = '';
        if (component.type === 'select') {
          defaultValue = component.attributes.default_value === 'true' || component.attributes.default_value === 'true';
        } else if (component.attributes.default_value !== undefined) {
          defaultValue = component.attributes.default_value;
        }

        const controlName = component.attributes.field_name || '';
        if (controlName) {
          this.formGroup.addControl(controlName, this.fb.control(defaultValue, validatorsToAdd));
        }
        if (component.attributes.actions?.comment) {
          this.formGroup.addControl(`${component.attributes.field_name}_comment`, new FormControl(''));
        }
        if (component.attributes.actions?.camera) {
          this.formGroup.addControl(`${component.attributes.field_name}_image`, new FormControl(null));
        }
      });
    });
    // Initialize isCollapsed property for each section
    this.demo2.component.forEach((section:any) => {
      if (section.canCollapsed) {
        section.isCollapsed = false; // Initially expanded
      }
    });

    // Initialize signature pad after form is built
    setTimeout(() => {
      this.initializeSignaturePad();
    }, 100);
  }


  getErrorMessage(field: string): string {
    const control = this.formGroup.get(field);

    if (control?.hasError('required')) {
      return `${field} is required`;
    }
    if (control?.hasError('pattern')) {
      return `${field} Invalid format`;
    }
    if (control?.hasError('minlength')) {
      return `Must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `Cannot exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (control?.hasError('pastDate')) return control.errors?.['pastDate'];
    if (control?.hasError('futureDate')) return control.errors?.['futureDate'];
    if (control?.hasError('minDate')) return control.errors?.['minDate'];
    if (control?.hasError('maxDate')) return control.errors?.['maxDate'];
    if (control?.hasError('invalidFileType')) return control.errors?.['invalidFileType'];
    if (control?.hasError('fileTooLarge')) return control.errors?.['fileTooLarge'];
    return '';
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  toggleSectionCollapse(section: FormSection) {
    if (section.canCollapsed) {
      section.isCollapsed = !section.isCollapsed;
    }
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.markFormGroupTouched(this.formGroup);
      console.log("Form Submitted Successfully", this.formGroup.value);
      console.log('Form is invalid');
      return;
    }
    const formData = new FormData();
    Object.keys(this.formGroup.controls).forEach(field => {
      const control = this.formGroup.get(field);
      if (control?.value instanceof File) {
        formData.append(field, control.value);
      } else {
        formData.append(field, control?.value || '');
      }
    });
    console.log("Form Submitted Successfully", this.formGroup.value);
  }



    onFileSelect(event: Event, fieldName: string) {
      const input = event.target as HTMLInputElement;
      if (input?.files?.length) {
        const file = input.files[0];

        // Get validations from the JSON configuration
        const fieldConfig = this.demo2.component.flatMap((section: any) => section.elements).find(
          (component: any) => component.attributes.field_name === fieldName
        );
        const validations = fieldConfig?.attributes.validations;

        // Validate file type
        const allowedExtensions = new RegExp(validations?.pattern || "\\.(jpg|jpeg|png)$", "i");
        if (!allowedExtensions.test(file.name)) {
          this.formGroup.get(fieldName)?.setErrors({ invalidFileType: true });
          return;
        }

        // Validate file size
        const maxSizeMB = validations?.maxSize || 5;
        if (file.size / 1024 / 1024 > maxSizeMB) {
          this.formGroup.get(fieldName)?.setErrors({ fileTooLarge: true });
          return;
        }

        // Preview the uploaded image
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedImages[fieldName] = reader.result as string;
        };
        reader.readAsDataURL(file);

        // Set the file as the value of the form control
        this.formGroup.get(fieldName)?.setValue(file);
        this.formGroup.get(fieldName)?.markAsTouched();
      }
    }

    onComment(component: any) {
      const key = `${component.attributes.field_name}_comment`;
      this.visibleComments[key] = !this.visibleComments[key];

    }
    onCamera(component: any) {
      const inputId = 'file_' + component.attributes.field_name;
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      fileInput?.click();

    }
    onFileSelected(event: Event, component: any) {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        const controlName = `${component.attributes.field_name}_image`;
        this.formGroup.get(controlName)?.setValue(file);
        component.attributes.uploadedFileName = file.name;

        const reader = new FileReader();
        reader.onload = () => {
          component.attributes.image_url = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
    onFlag(component: any) {
      console.log("Flag clicked for", component.attributes.field_name);
    }



// {
//   "component": [
//     {
//       "Title": "Information",
//       "canCollapsed": true,
//       "elements": [
//         {
//           "type": "text",
//           "attributes": {
//             "label": "Full Name",
//             "field_name": "Name",
//             "is_required": true,
//             "placeholder_text": "Enter Your Name",
//             "show_label": true,
//             "validations": {
//               "minlength": "3",
//               "maxlength": "18"
//             },
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": true
//             }
//           }
//         },
//         {
//           "type": "text",
//           "attributes": {
//             "label": "Email",
//             "field_name": "Email",
//             "is_required": true,
//             "placeholder_text": "Enter Your Email",
//             "show_label": true,
//             "validations": {
//               "pattern": "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
//             },
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "textarea",
//           "attributes": {
//             "label": "Address",
//             "field_name": "Address",
//             "is_required": true,
//             "placeholder_text": "Enter Your Address",
//             "show_label": true,
//             "actions": {
//               "comment": false,
//               "camera": true,
//               "flag": true
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "Personal Details",
//       "canCollapsed": true,
//       "elements": [
//         {
//           "type": "text",
//           "attributes": {
//             "label": "Phone No.",
//             "field_name": "Number",
//             "is_required": true,
//             "placeholder_text": "Enter Your Phone No.",
//             "show_label": true,
//             "default_value": "+91",
//             "validations": {
//               "minlength": "10",
//               "maxlength": "13",
//               "pattern": "^(\\+91)?[0-9]{10}$"
//             },
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "Select",
//           "multiselect": false,
//           "attributes": {
//             "label": "Are you above 18?",
//             "field_name": "Is adult",
//             "placeholder_text": "is your age above 18?",
//             "is_required": true,
//             "show_label": true,
//             "DataListId": "67fea30f0b3553c10431067b",
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "date",
//           "attributes": {
//             "label": "Date of Birth",
//             "field_name": "DOB",
//             "is_required": true,
//             "show_label": true,
//             "validations": {
//               "noFuture": "true",
//               "minDate": "2000-01-01",
//               "maxDate": "2025-04-16"
//             },
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "date",
//           "attributes": {
//             "label": "Event Date",
//             "field_name": "Event date",
//             "is_required": true,
//             "show_label": true,
//             "validations": {
//               "noPast": "true",
//               "minDate": "2025-04-16",
//               "maxDate": "2025-12-31"
//             },
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "Drop Downs",
//       "canCollapsed": true,
//       "elements": [
//         {
//           "type": "Select",
//           "multiselect": false,
//           "attributes": {
//             "label": "Are you available?",
//             "field_name": "is_available",
//             "placeholder_text": "SELECT ONE",
//             "DataListId": "67fea30f0b3553c10431067b",
//             "is_required": true,
//             "show_label": true,
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "Select",
//           "multiselect": false,
//           "attributes": {
//             "label": "EMPLOYMENT STATUS:",
//             "field_name": "employment_status",
//             "placeholder_text": "SELECT ONE",
//             "is_required": true,
//             "show_label": true,
//         	"DataListId": "67fea30f0b3553c10431067b",
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "Select",
//           "multiselect": false,
//           "attributes": {
//             "label": "Select Skills",
//             "field_name": "skills",
//             "placeholder_text": "Choose your skills",
//             "is_required": true,
//             "show_label": true,
//             "DataListId": "67fea30f0b3553c10431067b",
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "Grouped Dropdown",
//       "elements": [
//         {
//           "type": "Select",
//           "multiselect": false,
//           "attributes": {
//             "label": "Select Player",
//             "field_name": "player",
//             "placeholder_text": "Select Player here",
//             "is_required": true,
//             "show_label": true,
//             "DataListId": "67fea30f0b3553c10431067b",
//             "actions": {
//               "comment": true,
//               "camera": true,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "signature",
//           "attributes": {
//             "label": "Signature",
//             "field_name": "signature",
//             "is_required": true,
//             "show_label": true,
//             "pen_color": "black",
//             "actions": {
//               "comment": false,
//               "camera": false,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "map",
//           "attributes": {
//             "label": "Select Location",
//             "field_name": "location",
//             "is_required": true,
//             "show_label": true,
//             "default_lat": 28.6139,
//             "default_lng": 77.209,
//             "actions": {
//               "comment": true,
//               "camera": false,
//               "flag": false
//             }
//           }
//         },
//         {
//           "type": "file",
//           "attributes": {
//             "label": "Upload Image",
//             "field_name": "image",
//             "is_required": true,
//             "show_label": true,
//             "placeholder_text": "Upload Your Image",
//             "validations": {
//               "pattern": "\\.(jpg|jpeg|png)$",
//               "maxSize": "5"
//             },
//             "actions": {
//               "comment": false,
//               "camera": false,
//               "flag": false
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "Terms & Conditions",
//       "elements": [
//         {
//           "type": "link",
//           "attributes": {
//             "label": "Read and accept our",
//             "is_required": false,
//             "show_label": false,
//             "url": "https://youtube.com",
//             "link_text": "Terms & Conditions",
//             "actions": {
//               "comment": false,
//               "camera": false,
//               "flag": false
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "Form Guide",
//       "elements": [
//         {
//           "type": "image",
//           "attributes": {
//             "label": "Form Details",
//             "image_url": "https://images.unsplash.com/photo-1707455902309-a94c9f47e60a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//             "show_label": true,
//             "alt_text": "Guide to fill the form",
//             "actions": {
//               "comment": true,
//               "camera": false,
//               "flag": false
//             }
//           }
//         }
//       ]
//     },
//     {
//       "Title": "submit button",
//       "elements": [
//         {
//           "type": "button",
//           "attributes": {
//             "content": "Submit",
//             "button_type": "submit",
//             "actions": {
//               "comment": false,
//               "camera": false,
//               "flag": false
//             }
//           }
//         }
//       ]
//     }
//   ]
// }


Demo:any = {

  // {
  //     "FormName": "User Registration Form",
  //     "UserName": "john.doe",
  //     "CreatedBy": "adminUser01",
  //   "component": [
  //     {
  //       "Title": "Label",
  //       "canCollapsed": false,
  //       "isCollapsed": false,
  //       "elements": [
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "Label",
  //             "field_name": "Label",
  //             "is_required": true,
  //             "placeholder_text": "Type your Label",
  //             "show_label": false,
  //             "validations": {
  //               "minlength": "3",
  //               "maxlength": "12"
  //             },
  //             "actions": {
  //               "comment": true,
  //               "camera": false,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "TO BE COMPLETED BY THE PERSON COMPLETING THE INCIDENT",
  //       "elements": [
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "AREA OF INCIDENT:",
  //             "field_name": "AREA OF INCIDENT",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff33e74102309f2f948186",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "REPORT TYPE:",
  //             "field_name": "REPORT TYPE",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34464102309f2f948187",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "SECTION A: INCIDENTS INVOLVING PERSONAL INJURY OR ILLNESS",
  //       "canCollapsed": true,
  //       "elements": [
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "PHYSICAL BODY LOCATION OF INJURY:",
  //             "field_name": "BODY LOCATION OF INJURY",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34464102309f2f948187",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "MECHANISM OF INJURY:",
  //             "field_name": "MECHANISM OF INJURY:",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34c24102309f2f948188",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "NATURE OF INJURY:",
  //             "field_name": "NATURE OF INJURY:",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": true,
  //             "show_label": true,
  //              "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "DOES THE INJURED PERSON REQUIRE MEDICAL TREATMENT?",
  //             "field_name": "MEDICAL TREATMENT?",
  //             "placeholder_text": "Select Multiple",
  //             "is_required": false,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "SECTION B: INCIDENT DETAILS",
  //       "elements": [
  //         {
  //           "type": "date",
  //           "attributes": {
  //             "label": "INCIDENT DATE:",
  //             "field_name": "INCIDENT DATE:",
  //             "is_required": true,
  //             "show_label": true,
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "date",
  //           "attributes": {
  //             "label": "DATE REPORTED ON:",
  //             "field_name": "DATE REPORTED ON:",
  //             "is_required": true,
  //             "show_label": true,
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "NAME OF PERSON COMPLETING FORM:",
  //             "field_name": "PERSON COMPLETING FORM",
  //             "placeholder_text": "Select Worker",
  //             "is_required": false,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": true,
  //           "attributes": {
  //             "label": "HOW WAS THE INCIDENT REPORTED?",
  //             "field_name": "INCIDENT REPORTED",
  //             "placeholder_text": "Select multiple",
  //             "is_required": false,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "HAS THE RELEVANT HSR BEEN NOTIFIED OF THIS INCIDENT IN ACCORDANCE WITH THE PRIVACY POLICY?",
  //             "field_name": "PRIVACY POLICY",
  //             "placeholder_text": "Select One",
  //             "is_required": false,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "NAME OF HSR:",
  //             "field_name": "HSR",
  //             "placeholder_text": "Select Worker",
  //             "is_required": false,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "PERSON INVOLVED IN THE INCIDENT:",
  //             "field_name": "HSR",
  //             "placeholder_text": "Select Worker",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "EMPLOYEE PHONE NUMBER:",
  //             "field_name": "Phone Number",
  //             "is_required": true,
  //             "show_label": true,
  //             "placeholder_text": "Number",
  //             "actions": {
  //               "comment": false,
  //               "camera": false,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "Email:",
  //             "field_name": "Email",
  //             "is_required": true,
  //             "show_label": true,
  //             "placeholder_text": "Enter Emails",
  //             "validations": {
  //               "pattern": "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  //             },
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "EMPLOYMENT CATEGORY:",
  //             "field_name": "EMPLOYMENT CATEGORY:",
  //             "placeholder_text": "Select One",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "COMPANY NAME:",
  //             "field_name": "COMPANY NAME:",
  //             "placeholder_text": "Select One",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "OCCUPATION/TRADE:",
  //             "field_name": "OCCUPATION",
  //             "placeholder_text": "Select One",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "SURNAME:",
  //             "field_name": "SURNAME",
  //             "is_required": true,
  //             "show_label": true,
  //             "placeholder_text": "Enter Your Last Name",
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "FIRST NAME(S):",
  //             "field_name": "FIRST NAME",
  //             "is_required": true,
  //             "show_label": true,
  //             "placeholder_text": "Enter Your First Name",
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "EMPLOYMENT STATUS:",
  //             "field_name": "EMPLOYMENT STATUS",
  //             "placeholder_text": "Select One",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "Select",
  //           "multiselect": false,
  //           "attributes": {
  //             "label": "STATE",
  //             "field_name": "STATE",
  //             "placeholder_text": "Select One",
  //             "is_required": true,
  //             "show_label": true,
  //             "DataListId": "67ff34ed4102309f2f948189",
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "textarea",
  //           "attributes": {
  //             "label": "Customer",
  //             "field_name": "Customer",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "SITE ADDRESS",
  //             "field_name": "SITE ADDRESS",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "PROJECT",
  //             "field_name": "PROJECT",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "BUILDING",
  //             "field_name": "BUILDING",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "EXTERNAL LOCATION",
  //             "field_name": "EXTERNAL LOCATION",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "FLOOR",
  //             "field_name": "FLOOR",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "ROOM",
  //             "field_name": "ROOM",
  //             "is_required": false,
  //             "placeholder_text": "Short Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "textarea",
  //           "attributes": {
  //             "label": "LOCATION OF INCIDENT/HAZARD:",
  //             "field_name": "LOCATION OF INCIDENT/HAZARD ",
  //             "is_required": false,
  //             "placeholder_text": "Long Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "map",
  //           "attributes": {
  //             "label": "RECORD GPS COORDINATES OF INCIDENT OR HAZARD:",
  //             "field_name": "Current Location",
  //             "is_required": true,
  //             "show_label": true,
  //             "default_lat": 28.6139,
  //             "default_lng": 77.209,
  //             "actions": {
  //               "comment": true,
  //               "camera": false,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "textarea",
  //           "attributes": {
  //             "label": "DESCRIBE WHAT OCCURRED:",
  //             "field_name": "DESCRIBE WHAT OCCURRED",
  //             "is_required": false,
  //             "placeholder_text": "Long Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "NUMBER OF WITNESS:",
  //             "field_name": "NUMBER OF WITNESS:",
  //             "is_required": false,
  //             "placeholder_text": "Number of Witness",
  //             "show_label": true,
  //             "validations": {
  //               "pattern": "^s*[0-9]+s*$"
  //             },
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "DETAILS OF WITNESS",
  //       "canCollapsed": true,
  //       "isCollapsed": true,
  //       "elements": [
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "WITNESS NUMBER::",
  //             "field_name": "WITNESS NUMBER::",
  //             "is_required": false,
  //             "placeholder_text": "Number",
  //             "show_label": true,
  //             "validations": {
  //               "minlength": "1",
  //               "maxlength": "3",
  //               "pattern": "^s*[0-9]+s*$"
  //             },
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "SUR Name",
  //             "field_name": "SURName",
  //             "is_required": true,
  //             "placeholder_text": "Enter Your SUR Name",
  //             "show_label": true,
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "FIRST NAME(S):",
  //             "field_name": " First Name",
  //             "is_required": true,
  //             "placeholder_text": "Enter Your First Name",
  //             "show_label": true,
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": true
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "Phone No.",
  //             "field_name": "Number",
  //             "is_required": true,
  //             "placeholder_text": "Enter Your Phone No.",
  //             "show_label": true,
  //             "default_value": "+91",
  //             "validations": {
  //               "minlength": "10",
  //               "maxlength": "13",
  //               "pattern": "^(\\+91)?[0-9]{10}$"
  //             },
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         },
  //         {
  //           "type": "text",
  //           "attributes": {
  //             "label": "Email",
  //             "field_name": "Email",
  //             "is_required": true,
  //             "placeholder_text": "Enter Your Email",
  //             "show_label": true,
  //             "validations": {
  //               "pattern": "^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  //             },
  //             "actions": {
  //               "comment": true,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "ACTIONS TO PREVENT RE-OCCURANCE",
  //       "canCollapsed": false,
  //       "isCollapsed": false,
  //       "elements": [
  //         {
  //           "type": "textarea",
  //           "attributes": {
  //             "label": "WHAT ACTIONS ARE REQUIRED TO PREVENT A REOCCURRENCE OF INCIDENT?:",
  //             "field_name": "REOCCURRENCE OF INCIDENT",
  //             "is_required": false,
  //             "placeholder_text": "Long Answer",
  //             "show_label": true,
  //             "actions": {
  //               "comment": false,
  //               "camera": true,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "Signature",
  //       "canCollapsed": false,
  //       "isCollapsed": false,
  //       "elements": [
  //         {
  //           "type": "signature",
  //           "attributes": {
  //             "label": "Signature",
  //             "field_name": "signature",
  //             "is_required": true,
  //             "show_label": true,
  //             "pen_color": "black",
  //             "actions": {
  //               "comment": false,
  //               "camera": false,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "Additional Photos",
  //       "canCollapsed": false,
  //       "isCollapsed": false,
  //       "elements": [
  //         {
  //           "type": "file",
  //           "attributes": {
  //             "label": "Upload Image",
  //             "field_name": "image",
  //             "is_required": true,
  //             "show_label": false,
  //             "placeholder_text": "Browser Your Image",
  //             "validations": {
  //               "pattern": "\\.(jpg|jpeg|png)$",
  //               "maxSize": "5"
  //             },
  //             "actions": {
  //               "comment": false,
  //               "camera": false,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       "Title": "submit button",
  //       "canCollapsed": false,
  //       "isCollapsed": false,
  //       "elements": [
  //         {
  //           "type": "button",
  //           "attributes": {
  //             "content": "Submit",
  //             "button_type": "submit",
  //             "actions": {
  //               "comment": false,
  //               "camera": false,
  //               "flag": false
  //             }
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // }
 };

  // { "FormName": "User Registration Form",
  //       "UserName": "john.doe",
  //       "CreatedBy": "adminUser01",
  //     "component": [
  //       {
  //         "Title": "Label",
  //         "canCollapsed": false,
  //         "isCollapsed": false,
  //         "elements": [
  //           {
  //             "type": "text",
  //             "attributes": {
  //               "label": "Label",
  //               "field_name": "Label",
  //               "is_required": true,
  //               "placeholder_text": "Type your Label",
  //               "show_label": false,
  //               "validations": {
  //                 "minlength": "3",
  //                 "maxlength": "12"
  //               },
  //               "actions": {
  //                 "comment": true,
  //                 "camera": false,
  //                 "flag": false
  //               }
  //             }
  //           }
  //         ]
  //       },
  //     ]
  // }
}
