import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

declare let L: any;
import 'node_modules/leaflet/dist/leaflet.js';




@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.sass']
})
export class MapComponent implements AfterViewInit {

  public map_id: string = String(Math.round(Math.random() * 0xFFFF))
  public map: any;
  public marker: any;


  private markerIcon = new L.icon({
    iconUrl: 'assets/images/map-marker.png',
    
    iconSize: [32, 32],
    iconAnchor: [16, 32],

  })

  public mapLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://cartodb.com/attributions'>CartoDB</a>",
    subdomains: 'abcd',
    maxZoom: 19,
    noWrap: true
})

  @Input() coordinates: [number, number] = [0,0];

  constructor() { }

  ngAfterViewInit(): void {
    
    console.log(this.coordinates);

    this.map = L.map(this.map_id, {
      center: this.coordinates,
      zoom: 12,
      attributionControl: false,
      zoomControl: true,
      scrollWheelZoom: false,
      layers: [
        this.mapLayer
      ],
      maxBounds: L.latLngBounds(
        L.latLng(-89.98155760646617, -360),
        L.latLng(89.99346179538875, 360)
      )
    });

    this.addMarker();

  }

  private addMarker() {
    this.marker = new L.marker(this.coordinates, { icon: this.markerIcon }).addTo(this.map);
  }

}
