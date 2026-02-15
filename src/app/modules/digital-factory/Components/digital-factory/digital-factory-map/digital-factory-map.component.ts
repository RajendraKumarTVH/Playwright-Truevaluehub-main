import { Component, Input, OnDestroy, SimpleChanges, ViewChild, OnChanges, ElementRef, AfterViewInit, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { DigitalFactoryService } from '../../../Service/digital-factory.service';
import { defaultLat, defaultLong, defaultZoom } from '../../Shared/digital-factory-constants';
import { Router } from '@angular/router';
import { DigitalFactoryRouteLinks } from '../../Shared/digital-factory-route-links';
import { searchTypeContains, searchTypeIs } from 'src/app/shared/constants';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { geoCodes } from './geo-codes';
import { SignalrDfService } from 'src/app/shared/services/signalr-df.service';

@Component({
  selector: 'app-digital-factory-map',
  templateUrl: './digital-factory-map.component.html',
  styleUrls: ['./digital-factory-map.component.scss'],
  standalone: true,
  imports: [GoogleMapsModule, FormsModule, CommonModule],
})
export class DigitalFactoryMapComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() searchModel?: SearchBarModelDto[] = [];
  @Input() tab = 'supplierDirectory';
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @ViewChild('mpRef', { static: false }) mapElement!: ElementRef;
  currentSelSearchModel?: SearchBarModelDto[] = [];
  signalrDfService = inject(SignalrDfService);

  latitude = defaultLat;
  longitude = defaultLong;
  zoom = defaultZoom;
  markers: any[] = [];
  visibleMarkers: { lat: number; lng: number; country: any; icon: string; name?: string; address?: string; supplierId?: number; count?: number }[] = [];
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  bounds: any;
  selectedMarker: any;
  center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 };
  markerPosition: google.maps.LatLngLiteral = this.center;
  visibleMarkerCount = 0;
  mapStyles: google.maps.MapTypeStyle[] = [];
  map: google.maps.Map;
  canvas: HTMLCanvasElement;
  hoveredIndex?: number;
  private currentOverlay: google.maps.OverlayView | null = null;

  constructor(
    private http: HttpClient,
    private digitalFactoryService: DigitalFactoryService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.signalrDfService.getHubConnection()?.on('onReceiveDFMarkerData', (data) => {
      if (data.length > 0) {
        data = data.filter((x) => x.lat && x.lng);
        this.markers.push(...data);
        this.addCanvasOverlay(this.markers);
      }
    });
  }
  mapOptions: google.maps.MapOptions = {
    styles: this.getMapStyle(),
    disableDefaultUI: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  ngAfterViewInit(): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: this.zoom,
      styles: this.getMapStyle(),
      disableDefaultUI: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    let loaded = false;
    this.map.addListener('idle', () => {
      if (loaded == false) {
        this.loadMarkers();
        loaded = true;
      }
    });

    this.map.addListener('dragend', () => {
      this.loadMarkers();
    });
  }
  private loadMarkers() {
    const searhModel = this.searchModel ?? [];
    if (this.searchModel?.length < this.currentSelSearchModel.length) {
      this.currentSelSearchModel = this.searchModel;
    } else {
      this.currentSelSearchModel = this.searchModel?.filter((item1) => !this.currentSelSearchModel.some((item2) => item2.index === item1.index)) ?? [];
    }
    const bounds = this.map.getBounds();
    this.bounds = {
      north: bounds!.getNorthEast().lat(),
      south: bounds!.getSouthWest().lat(),
      east: bounds!.getNorthEast().lng(),
      west: bounds!.getSouthWest().lng(),
    };
    if (this.tab === 'supplierDirectory') {
      if (searhModel.length === 0) {
        this.digitalFactoryService.getDFHubSupplierMarkers(this.zoom, this.bounds).subscribe();
      } else if (this.currentSelSearchModel.length > 0) {
        this.digitalFactoryService
          .getSupplierMarkers(this.zoom, this.bounds, this.currentSelSearchModel)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (data) => {
              data = data.filter((x) => x.lat && x.lng);
              this.markers = data;
              this.currentSelSearchModel = this.searchModel ?? [];
              this.markers.push(...data);
              this.addCanvasOverlay(this.markers);
            },
          });
      }

      return;
    }
    this.digitalFactoryService
      .getDigitalFactoryMarkers(searhModel)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          data = data.filter((x) => x.lat && x.lng);
          this.addCanvasOverlay(data);
        },
      });
  }
  addCanvasOverlay(points: { lat: number; lng: number; name: string }[]) {
    const overlay = new google.maps.OverlayView();
    let canvasElement: HTMLCanvasElement;

    overlay.onAdd = function () {
      canvasElement = document.createElement('canvas');
      canvasElement.style.position = 'absolute';
      canvasElement.style.zIndex = '1000';
      canvasElement.style.pointerEvents = 'auto';

      const panes = this.getPanes();
      panes.overlayLayer.appendChild(canvasElement);
      panes.overlayMouseTarget.appendChild(canvasElement);

      // // Attach mousemove only once
      // canvasElement.addEventListener('mousemove', (event) => {
      //     const rect = canvasElement.getBoundingClientRect();
      //     const mouseX = event.clientX - rect.left;
      //     const mouseY = event.clientY - rect.top;

      //     const projection = this.getProjection();
      //     const map = this.getMap() as google.maps.Map;
      //     const bounds = map.getBounds();
      //     const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());

      //     hoveredIndex = -1;
      //     let found = -1;

      //     points.forEach((pt, index) => {
      //         const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));

      //         // Convert marker point to canvas-local coordinates
      //         const x = pixel.x - sw.x;
      //         const y = pixel.y - sw.y;

      //         const dx = mouseX - x;
      //         const dy = mouseY - y;
      //         const dist = Math.sqrt(dx * dx + dy * dy);

      //         if (dist < 10) {
      //             found = index;
      //         }
      //     });

      //     if (hoveredIndex !== found) {
      //         hoveredIndex = found;
      //         overlay.draw();  // Redraw only when changed
      //     }
      // });
    };

    overlay.draw = function () {
      const projection = this.getProjection();
      const map = this.getMap() as google.maps.Map;
      const bounds = map?.getBounds();
      if (!bounds) return;

      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());

      const width = Math.abs(ne.x - sw.x);
      const height = Math.abs(sw.y - ne.y);

      canvasElement.style.left = sw.x + 'px';
      canvasElement.style.top = ne.y + 'px';
      canvasElement.width = width;
      canvasElement.height = height;

      const ctx = canvasElement.getContext('2d')!;
      //ctx.clearRect(0, 0, width, height);

      points.forEach((p) => {
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(p.lat, p.lng));
        const x = pixel.x - sw.x;
        const y = pixel.y - ne.y;

        // if (index === hoveredIndex) {
        //     ctx.fillStyle = 'red';
        //     ctx.beginPath();
        //     ctx.arc(x, y, 8, 0, 2 * Math.PI);
        //     ctx.fill();

        //     ctx.fillStyle = 'black';
        //     ctx.font = '14px Arial';
        //     ctx.fillText(p.name || '', x + 10, y + 4);
        // } else {
        ctx.fillStyle = '#3F83F9';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        if (map.getZoom() >= 12) {
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.fillText(p.name || '', x + 8, y + 4);
        }
        // }
      });
    };

    overlay.onRemove = function () {
      if (canvasElement?.parentNode) {
        canvasElement.parentNode.removeChild(canvasElement);
      }
    };

    if (this.currentOverlay) {
      this.currentOverlay.setMap(null);
    }

    this.currentOverlay = overlay;

    overlay.setMap(this.map);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const searchedValues = changes['searchModel']?.currentValue;
    const tabChanged = changes['tab']?.currentValue;
    if (searchedValues || tabChanged) {
      if (searchedValues?.length > 0) {
        const searchVal = searchedValues[searchedValues.length - 1];
        if (searchVal.searchType === searchTypeIs || searchVal.searchType === searchTypeContains) {
          this.loadFilteredMarkers(searchVal.searchKey, [searchVal.searchValue]);
        }
      } else {
        this.latitude = defaultLat;
        this.longitude = defaultLong;
        if (this.map) {
          this.map.setZoom(4);
          this.map.setCenter({ lat: this.latitude, lng: this.longitude });
          this.loadMarkers();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onMarkerClick(marker: any, mapMarker: MapMarker): void {
    this.selectedMarker = marker;
    this.infoWindow.open(mapMarker);
  }

  private loadFilteredMarkers(searchKey: string, values?: string[]) {
    const searchValue = values![0];
    this.map.setZoom(4);
    this.currentOverlay?.setMap(null);
    this.currentOverlay = null;
    if (searchKey === 'Country') {
      const country = values![values!.length - 1];
      const location = this.getGeocode(country);
      this.latitude = location.lat;
      this.longitude = location.lng;

      this.map.setCenter({ lat: this.latitude, lng: this.longitude });
      this.loadMarkers();
    } else if (searchKey === 'Supplier') {
      const matchingSuppliers = this.markers.filter((x) => x.name?.toLowerCase().includes(searchValue.toLowerCase()));
      if (matchingSuppliers.length > 0) {
        this.markers = matchingSuppliers;
        this.map.setCenter({ lat: matchingSuppliers[0].lat, lng: matchingSuppliers[0].lng });
        this.addCanvasOverlay(this.markers.map((x) => ({ lat: x.lat, lng: x.lng, name: x.name })));
      } else {
        this.digitalFactoryService
          .getSupplierMarkerByName(searchValue)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (data) => {
              if (data) {
                this.markers = [data];
                this.latitude = data.lat;
                this.longitude = data.lng;
                this.zoom = 7;
                this.map.setCenter({ lat: this.latitude, lng: this.longitude });
                this.addCanvasOverlay([{ lat: data.lat, lng: data.lng, name: data.name }]);
              }
            },
          });
      }
    }
  }

  private getGeocode(country: string) {
    return geoCodes.find((x) => x.name.toLowerCase().includes(country.toLowerCase()));
  }

  onViewSupplier() {
    this.router.navigate([DigitalFactoryRouteLinks.supplierInfo, this.selectedMarker.supplierId]);
  }

  private getMapStyle() {
    return [
      {
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#523735',
          },
        ],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#e0e4ec' }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#e0e4ec',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f8f8fa' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f8f8fa' }],
      },
    ];
  }
}
