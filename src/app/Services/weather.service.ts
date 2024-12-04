import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl = 'https://xml.customweather.com/xml';
  private baseUrl = 'http://cws.customweather.com/data';

  constructor(private http: HttpClient) { }

  getWeatherData(lat: number, lon: number): Observable<any> {
    const params = new URLSearchParams({
      client: 'cognitive',
      client_password: '59kjGu3WXm',
      product: 'hourly_forecast',
      latitude: lat.toString(),
      longitude: lon.toString(),
    });
    const url = `${this.apiUrl}?${params}`;
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    return this.http.get(url, { headers });
  }

  

  getCustomWeatherData(
    latitude: number,
    longitude: number,
    start: string,
    end: string
  ): Observable<any> {
      const params = new HttpParams()
      .set('client', 'cognitive')
      .set('client_password', '59kjGu3WXm')
      .set('layer', 'cfsr_hourly_obs:windspeed:700hPa')
      .append('layer', 'cfsr_hourly_obs:winddirection_deg:700hPa')
      .append('layer', 'cfsr_hourly_obs:temp:250hPa')
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('start', start.toString())
      .set('end', end.toString());

      return this.http.get(`${this.baseUrl}?${params.toString()}`,{
         responseType: 'text', 
       });
    }



    getFlightLevelWeatherDaTa(
      latitude: number,
      longitude: number,
      start: string,
      end: string
    ): Observable<any> {
      const params = new HttpParams()
        .set('client', 'cognitive')
        .set('client_password', '59kjGu3WXm')
        .set('layer', 'gfs0p25hourly:windspeed:500hPa')
        .append('layer', 'gfs0p25hourly:winddirection_deg:500hPa')
        .append('layer', 'gfs0p25hourly:cloud_cover:blcll')
        .append('layer', 'gfs0p25hourly:cape:sfc')
        .set('cws.init_time', 'latest')
        .set('latitude', latitude.toString())
        .set('longitude', longitude.toString())
        .set('start', start.toString())
        .set('end', end.toString());
  
        return this.http.get(`${this.baseUrl}?${params.toString()}`,{
          responseType: 'text', 
        });
    }
  }

  


