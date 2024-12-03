import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl = 'https://xml.customweather.com/xml';
  // private client = 'cognitive'; // Add your client ID
  // private clientPassword = '59kjGu3WXm'; // Add your client password

  constructor(private http: HttpClient) { }

  // getWeatherData(lat: number, lon: number): Observable<any> {
  //   const url = `${this.apiUrl}?client=${this.client}&client_password=${this.clientPassword}&product=hourly_forecast&latitude=${lat}&longitude=${lon}`;
  //   console.log(url)

  //   return this.http.get(url, { responseType: 'text' });
  // }

  getWeatherData(lat: number, lon: number): Observable<string> {
    const params = new URLSearchParams({
      client: 'cognitive',
      client_password: '59kjGu3WXm',
      product: 'hourly_forecast',
      latitude: lat.toString(),
      longitude: lon.toString(),
    });

    return this.http.get(`${this.apiUrl}?${params.toString()}`, {
      responseType: 'text',
    });
  }



  
}

