export interface DateValidations {
  minDate?: string;  // Expected format: "YYYY-MM-DD"
  maxDate?: string;  // Expected format: "YYYY-MM-DD"
  noFuture?: boolean;
  noPast?: boolean;
}
export interface FormJson {
  userName?:string;
  formName?:string;
  createdBy?:string;
  createdDate?:Date;
  updatedDate?:Date;
  component: FormSection[];
}
export interface FormSection {
  title: string;
  elements: FormComponent[];
  canCollapsed?: boolean;
  isCollapsed?: boolean;
}

export interface FormComponent {
  type: string;
  multiselect?: boolean;
  attributes: {
    field_name?: string;
    label?: string;
    show_label?: boolean;
    is_required?: boolean;
    default_value?: string;
    placeholder_text?: string;
    validations?: any;
    pen_color?:string;
    actions: any; // Ensure ActionModel is defined or imported
    uploadedFileName?: string;
    default_lat?:number;
    default_lng?:number;
    url?:string;
    link_text?:string;
    image_url?:string;
    alt_text?:string;
    height?:number;
    content?:string;
    button_type?:string;
    dataListId?:string;
    dataSource?: any;
    // Add other properties as needed
  };
}
export interface DropdownData {
  id?: string;
  list: FormListData[];
}

export interface FormListData {
  title?: string;
  items: ListValue[];
}

export interface ListValue {
  value: string;
}


export interface ActionModel {
  comment?: boolean; // Define the properties of ActionModel as needed
  camera?: boolean;
  flag?: boolean;
}


