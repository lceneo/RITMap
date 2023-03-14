import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {IRequest} from "../models/IRequest";

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {

  private readonly APIKEY: string = "3d4a579785f04f168a468177072fe3c3";

  constructor(private httpClient: HttpClient) { }

  public getAdress(lon: number, lat: number): Observable<any>{
    return this.httpClient.get<IRequest>(
      `https://api.opencagedata.com/geocode/v1/json?key=${this.APIKEY}&q=${lat}+${lon}&pretty=1&address_only=1&language=ru`)
      .pipe(
        map(v => v.results[0].formatted)
      );
  };
}
