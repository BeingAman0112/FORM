import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class mapLoadServices {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  loadGoogleMaps(): Promise<void> {
    // Only proceed if we're in a browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(); // Return resolved promise for server-side
    }

    // Check if Google Maps API is already loaded
    // if (window.google && window.google.maps) {
    //   console.log("Google Maps API already loaded");
    //   this.isLoaded = true;
    //   return Promise.resolve();
    // }

    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    console.log("Loading Google Maps API...");

    this.loadPromise = new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCwF16DnyFmK967LUYfDR5gLGbe_v8_zCs&libraries=places&v=beta`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log("Google Maps API loaded successfully");
          this.isLoaded = true;
          resolve();
        };

        script.onerror = (error) => {
          console.error("Error loading Google Maps API:", error);
          reject(error);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Exception while loading Google Maps API:", error);
        reject(error);
      }
    });

    return this.loadPromise;
  }
}
