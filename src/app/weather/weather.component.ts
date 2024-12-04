
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
  private weatherData: any;
  private markersSet = new Set<string>();
  private markers: L.Marker[] = []; // Array to store all markers
  isCustomWeatherDataVisible: boolean = false;
  iscwsCustomWeatherDataVisible: boolean = false;
  isFlightLevelWeatherData: boolean = false;



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
      if (this.isCustomWeatherDataVisible) {
        this.fetchForecastData();
      }
      else if (this.iscwsCustomWeatherDataVisible) {
        this.fetchCustomWeatherData();
      }
      else if (this.isFlightLevelWeatherData) {
        this.featchFlightLevelWeatherData();
      }
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

  toggleCustomWeatherData(): void {
    if (this.iscwsCustomWeatherDataVisible) {
      this.clearData();
    } else {
      this.fetchCustomWeatherData();
    }
    this.iscwsCustomWeatherDataVisible = !this.iscwsCustomWeatherDataVisible;
  }

  toggleFlightLevelWeatherData(): void {
    if (this.isFlightLevelWeatherData) {
      this.clearData();
    } else {
      this.featchFlightLevelWeatherData();
    }
    this.isFlightLevelWeatherData = !this.isFlightLevelWeatherData;
  }

  clearData(): void {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
    this.markersSet.clear();
    this.markersLayer.clearLayers();
  }

  fetchForecastData(): void {
    const center = this.map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    this.weatherService.getWeatherData(lat, lon).subscribe({
      next: (data) => {
        if (data) {
          this.weatherData = data;
          console.log('ForecastData:', this.weatherData);
          this.displayForecastData();
        }
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
      },
    });
  }


  displayForecastData(): void {
    const weatherData = this.weatherData?.report;
    const cityName = weatherData.city_name;
    const latitude = parseFloat(weatherData.latitude);
    const longitude = parseFloat(weatherData.longitude);
    const forecasts = weatherData.location.forecast

    forecasts.forEach((forecast: any) => {
      const description = forecast?.description || 'N/A';
      const temperature = forecast?.temperature || 'N/A';
      const WindSpeed = forecast?.wind_speed || 'N/A';
      const Visibility = forecast?.visibility || 'N/A';
      const Humidity = forecast?.humidity || 'N/A';
      const DewPoint = forecast?.dew_point || 'N/A';

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

    })
  }


  private fetchCustomWeatherData(): void {
    const center = this.map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    const now = new Date();
    const endTime = now.toISOString(); // Current time as end time
    const startTime = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(); // Subtract 48 hours (2 days)

    this.weatherService.getCustomWeatherData(lat, lon, startTime, endTime).subscribe({
      next: (data) => {
        console.log('Custom WeatherData API Response:', data);

        parseString(data, (err: any, result: any) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return;
          }

          console.log('Parsed Custom WeatherData Result:', result);
          this.weatherData = result;
          this.displayCustomWeatherData();

        });
      },
      error: (err) => {
        console.error('Error fetching data from new API:', err);
      },
    });
  }

  displayCustomWeatherData(): void {
    if (!this.weatherData || !this.weatherData.cws?.report?.[0]) {
      console.error('Invalid forecast data format');
      return;
    }

    const reports = this.weatherData.cws.report; // Extract all reports
    reports.forEach((report: any) => {
      const lat = parseFloat(report.$?.latitude);
      const lon = parseFloat(report.$?.longitude);
      const markerId = `${lat},${lon}`; // Create a unique key from latitude and longitude

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

      const marker = L.marker([lat, lon], { icon: customIcon });
      const popupContent = `
          <strong>Location:</strong>${report.$?.nearest_city_name || 'Unknown'}<br>
          <strong>Elevation:</strong> ${report.$?.elevation || 'N/A'}<br>
          <strong>WindSpeedData:</strong> ${report.model[0].variable[0].data[0] || 'N/A'}<br>
          <strong>WindDirectionData:</strong> ${report.model[0].variable[1].data[0] || 'N/A'}<br>
          <strong>TemperatureData:</strong> ${report.model[0].variable[2].data[0] || 'N/A'}
        `;
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      this.markersLayer.addTo(this.map);

    });
  }

  featchFlightLevelWeatherData(): void {
    const center = this.map.getCenter();
    const lat = center.lat;
    const lon = center.lng;
    const now = new Date();
    const endTime = now.toISOString(); // Current time as end time
    const startTime = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    this.weatherService.getFlightLevelWeatherDaTa(lat, lon, startTime, endTime).subscribe({
      next: (data) => {
        console.log('Flight Level Weather API Response:', data);

        parseString(data, (err: any, result: any) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return;
          }

          console.log('Parsed Flight Level Weather Result:', result);
          this.weatherData = result;
          this.displayFlightLevelWeatherData();
        });
      },
      error: (err) => {
        console.error('Error fetching data from new API:', err);
      },
    });
  }

  displayFlightLevelWeatherData(): void {
    if (!this.weatherData || !this.weatherData.cws?.report?.[0]) {
      console.error('Invalid forecast data format');
      return;
    }

    const reports = this.weatherData.cws.report; // Extract all reports
    reports.forEach((report: any) => {
      const lat = parseFloat(report.$?.latitude);
      const lon = parseFloat(report.$?.longitude);
      const markerId = `${lat},${lon}`; // Create a unique key from latitude and longitude

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

      const marker = L.marker([lat, lon], { icon: customIcon });
      const popupContent = `
        <strong>Location:</strong>${report.$?.nearest_city_name || 'Unknown'}<br>
        <strong>Elevation:</strong> ${report.$?.elevation || 'N/A'}<br>
        <strong>WindSpeedData:</strong> ${report.model[0].variable[0].data[0] || 'N/A'}<br>
        <strong>WindDirectionData:</strong> ${report.model[0].variable[1].data[0] || 'N/A'}<br>
        <strong>CloudCoverData:</strong> ${report.model[0].variable[2].data[0] || 'N/A'}
      `;
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      this.markersLayer.addTo(this.map);

    });
  }
}




