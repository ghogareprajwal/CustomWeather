
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { WeatherService } from '../Services/weather.service';
import { parseString } from 'xml2js';



@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  private map: any;
  private markersLayer = L.layerGroup(); // Layer group for markers
  private forecastData: any;
  private markersSet = new Set<string>();
  private markers: L.Marker[] = []; // Array to store all markers
  isCustomWeatherDataVisible: boolean = false;
 
  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.initializeMap();
   
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([20.5937, 78.9629], 5); // Default coordinates for India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('moveend', () => {
      this.fetchForecastData();
    });
   
  }

  toggleForecastData(): void {
    if (this.isCustomWeatherDataVisible) {
      this.clearData();
    } else {
      this.fetchForecastData();
    }
    this.isCustomWeatherDataVisible = !this.isCustomWeatherDataVisible;
  }



  clearData(): void {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
  }

  fetchForecastData(): void {
    const center = this.map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    this.weatherService.getWeatherData(lat, lon).subscribe({
      next: (data) => {
        console.log(data)
        parseString(data, (err: any, result: any) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return;
          }
          this.forecastData = result;
          console.log('ForecastData:', this.forecastData);
          this.displayForecastData();
        });
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
      },
    });
  }


  displayForecastData(): void {
    const location = this.forecastData?.report?.location?.[0];
    if (location) {
      const cityName = location.$.city_name;
      const latitude = parseFloat(location.$.latitude);
      const longitude = parseFloat(location.$.longitude);
      const temperature = location.forecast[0]?.$.temperature || 'N/A';
      const description = location.forecast[0]?.$.description || 'N/A';
      const Visibility = location.forecast[0]?.$.visibility || 'N/A';
      const WindSpeed = location.forecast[0]?.$.wind_speed || 'N/A';
      const Humidity = location.forecast[0]?.$.humidity || 'N/A';
      const DewPoint = location.forecast[0]?.$.dew_point || 'N/A';

      const markerId = `${latitude},${longitude}`; // Create a unique key from latitude and longitude

      if (this.markersSet.has(markerId)) {
        return;
      }
      // Add the marker ID to the set
      this.markersSet.add(markerId);

      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon });
      const popupContent = `
          <strong>CityName:</strong>${cityName}<br>
          <strong>Temperature:</strong>${temperature}<br>
          <strong>Visibility:</strong> ${Visibility}<br>
          <strong>WindSpeed:</strong> ${WindSpeed}<br>
          <strong>Humidity:</strong> ${Humidity}<br>
          <strong>DewPoint:</strong> ${DewPoint}<br>
          <strong>Description:</strong> ${description}
        `;
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      this.markersLayer.addTo(this.map);
    }
  }


 
}




