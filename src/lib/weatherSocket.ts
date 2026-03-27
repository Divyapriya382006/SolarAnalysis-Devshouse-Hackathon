import { useState, useEffect } from 'react';

export interface WeatherData {
  temp: number;
  cloudiness: number; // 0-100%
  rain: number; // mm/h
  sunlight: number; // W/m2
  shadowImpact: number; // 0-100%
  status: 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Rainy' | 'Stormy';
}

class MockWeatherSocket {
  private listeners: Set<(data: WeatherData) => void> = new Set();
  private interval: NodeJS.Timeout | null = null;
  private currentData: WeatherData = {
    temp: 28,
    cloudiness: 10,
    rain: 0,
    sunlight: 850,
    shadowImpact: 5,
    status: 'Sunny',
  };

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    this.interval = setInterval(() => {
      // Add random walk to simulate live weather changes
      const dTemp = (Math.random() - 0.5) * 0.5;
      const dCloud = (Math.random() - 0.5) * 5;
      
      let newCloud = Math.max(0, Math.min(100, this.currentData.cloudiness + dCloud));
      let newTemp = Math.max(15, Math.min(45, this.currentData.temp + dTemp));
      
      let newRain = 0;
      let newSun = 1000 - (newCloud * 8); // Base sunlight minus cloud cover impact
      newSun = Math.max(0, newSun + (Math.random() - 0.5) * 20); // Add jitter
      
      let newStatus = this.currentData.status;

      if (newCloud > 80) {
        newStatus = Math.random() > 0.5 ? 'Rainy' : 'Overcast';
        newRain = Math.random() > 0.5 ? Math.random() * 10 : 0;
        newSun = Math.max(50, newSun - 400); // Massive drop
      } else if (newCloud > 40) {
        newStatus = 'Partly Cloudy';
      } else {
        newStatus = 'Sunny';
      }

      this.currentData = {
        temp: Number(newTemp.toFixed(1)),
        cloudiness: Number(newCloud.toFixed(0)),
        rain: Number(newRain.toFixed(1)),
        sunlight: Number(newSun.toFixed(0)),
        shadowImpact: Number((newCloud * 0.4 + (newRain > 0 ? 20 : 0)).toFixed(0)), // Shadows depend on cloud diffusion
        status: newStatus,
      };

      this.listeners.forEach(l => l(this.currentData));
    }, 2000); // Emit every 2 seconds for active VR feel
  }

  subscribe(callback: (data: WeatherData) => void) {
    this.listeners.add(callback);
    callback(this.currentData); // Initial ping
    return () => { this.listeners.delete(callback); };
  }
}

const socketInstance = new MockWeatherSocket();

export function useLiveWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 28, cloudiness: 10, rain: 0, sunlight: 850, shadowImpact: 5, status: 'Sunny'
  });

  useEffect(() => {
    return socketInstance.subscribe(setWeather);
  }, []);

  return weather;
}
