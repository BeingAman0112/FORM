import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoreDataService {
  private baseUrl: string = "";

  private getForm = 'api/Form'
  private getAllForm = 'api/Form'

  constructor(private http: HttpClient) {

      if (window.location.origin.includes("localhost")) {
        this.baseUrl = "https://localhost:44305/";

      }
      else {
        this.baseUrl = window.location.origin + "/api";
      }

    this.getForm = this.baseUrl + this.getForm;
    this.getAllForm = this.baseUrl + this.getAllForm;

  }

  getFormByID(id: string):Observable<any> {
    return this.http.get(this.getForm+`/${id}`);
  }
  getAllforms():Observable<any> {
    return this.http.get(this.getAllForm);
  }
}
