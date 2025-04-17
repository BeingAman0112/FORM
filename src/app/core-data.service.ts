import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { FormJson } from './home/Model/model';

@Injectable({
  providedIn: 'root'
})
export class CoreDataService {
  private baseUrl: string = "";
  // Forms API
  private getForm = 'api/Form'
  private getAllForm = 'api/Form'
  private saveForm = 'api/Form';

  // FormList API
  private getFormList = 'api/FormListData'
  private getAllFormList = 'api/FormListData'
  private saveFormList = 'api/FormListData';

  constructor(private http: HttpClient) {

      if (window.location.origin.includes("localhost")) {
        this.baseUrl = "https://localhost:44305/";

      }
      else {
        this.baseUrl = window.location.origin + "/api";
      }

    this.getForm = this.baseUrl + this.getForm;
    this.getAllForm = this.baseUrl + this.getAllForm;
    this.saveForm = this.baseUrl + this.saveForm;

    this.getFormList = this.baseUrl + this.getFormList;
    this.getAllFormList = this.baseUrl + this.getAllFormList;
    this.saveFormList = this.baseUrl + this.saveFormList;

  }

  getFormByID(id: string):Observable<any> {
    return this.http.get(this.getForm+`/${id}`);
  }
  getAllforms():Observable<any> {
    return this.http.get(this.getAllForm);
  }
  saveFormById(form: FormJson):Observable<any> {
    return this.http.post(this.saveForm, form);
  }

  getFormListByID(id: string):Observable<any> {
    return this.http.get(this.getFormList+`/${id}`);
  }
  getallFormList():Observable<any> {
    return this.http.get(this.getAllFormList);
  }
  saveFormListById(form: any):Observable<any> {
    return this.http.post(this.saveFormList, form);
  }
}
