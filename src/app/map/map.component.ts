import { Component, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mapLoadServices } from './mapLoadServices';

//Declare namespace Without this Google library not work :---
declare namespace google.maps {
  export function importLibrary(name: string): Promise<any>;
}

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Input() defaultLat: number = 28.6139; // Default Latitude (Delhi)
  @Input() defaultLng: number = 77.2090; // Default Longitude (Delhi)
  mapCenter: { lat: number; lng: number; } | undefined;

  map!: any;
  marker!: any;
  isBrowser: boolean;

  constructor(
    private googleMaploadService: mapLoadServices,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    // Only proceed if we're in a browser environment
    if (!this.isBrowser) {
      return;
    }

    try {
      await this.googleMaploadService.loadGoogleMaps();
      // Add a small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        this.initMap();
      }, 100);
    } catch (error) {
      console.error("Error loading Google Maps:", error);
    }
  }

  async initMap(): Promise<void> {
    if (!this.isBrowser || !this.mapElement) {
      console.error("Map cannot be initialized: Browser environment or map element not available");
      return;
    }

    try {
      const { Map } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

      // Use ViewChild reference instead of getElementById
      const mapDiv = this.mapElement.nativeElement;

      // console.log("Map element:", mapDiv);
      // console.log("Map dimensions:", mapDiv.offsetWidth, mapDiv.offsetHeight);

      const mapOptions = {
        zoom: 15,
        center: this.mapCenter || { lat: this.defaultLat, lng: this.defaultLng },
        mapId: "hybrid",
      };

      // console.log("Creating map with options:", mapOptions);

      this.map = new Map(mapDiv, mapOptions);

      // console.log("Map created:", this.map);

      this.mapCenter = { lat: this.defaultLat, lng: this.defaultLng };

      // Create a draggable marker at the center
      const markerPosition = this.mapCenter;
        this.marker = new AdvancedMarkerElement({
          map: this.map,
          position: markerPosition,
          gmpDraggable: true,
        });

        // Add event listener for marker drag end
        this.marker.addEventListener('dragend', () => {
          const position = this.marker.position;
          this.mapCenter = { lat: position.lat(), lng: position.lng() };
          this.locationSelected.emit(this.mapCenter);

          // Center the map on the marker
          this.map.panTo(position);
        });

      // Add click listener to the map to allow placing the marker anywhere
      this.map.addListener('click', (event: any) => {
        const clickedPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };

        // Update marker position
        if (this.marker.setPosition) {
          // For older Marker
          this.marker.setPosition(clickedPosition);
        } else {
          // For AdvancedMarkerElement
          this.marker.position = clickedPosition;
        }

        this.mapCenter = clickedPosition;
        this.locationSelected.emit(this.mapCenter);

        // Optional: Center the map on the new marker position
        this.map.panTo(clickedPosition);
      });

      // For updating location when map becomes idle (optional)
      this.map.addListener("idle", () => {
        const center = this.map.getCenter();
        if (center) {
          const centerPosition = { lat: center.lat(), lng: center.lng() };
          // Only update if we want the map center to be the location (uncomment if needed)
          // this.mapCenter = centerPosition;
          // this.locationSelected.emit(this.mapCenter);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }
}
