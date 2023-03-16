import { Injectable } from '@angular/core';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromEvent, Subscription} from "rxjs";
import {MapBrowserEvent} from "ol";
import {toLonLat} from "ol/proj";
import {MapWithPoints} from "../data-entities/MapWithPoints";
import {CustomPoint} from "../data-entities/CustomPoint";
import {CoordinateService} from "./coordinate.service";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  public clickSubscription!: Subscription;

  constructor(private coordinateService: CoordinateService) { }

  public initialiseMap(): MapWithPoints{
      const map = new MapWithPoints({
        view: new View({
          center: [0, 0],
          zoom: 1,
        }),
        layers: [
          new TileLayer({
              source: new OSM()
            })],
        target: 'ol-map'
      }, "../../assets/img/marker.svg");
      const previousPointsJSON = localStorage.getItem("points");
      const previousTrackJSON = localStorage.getItem("trackProvided?");
      if(previousPointsJSON !== null)
        JSON.parse(previousPointsJSON).forEach((p: CustomPoint) => map.addPoint(p));
      if(previousTrackJSON !== null)
        map.connectPoints(JSON.parse(previousTrackJSON));
      this.initialiseMarkerCreation(map);
      return map;
  }

  private initialiseMarkerCreation(map: MapWithPoints): void{
    this.clickSubscription = fromEvent<MapBrowserEvent<any>>(map, "click")
      .subscribe(v => {
        let [lon, lat] = toLonLat(v.coordinate);
        let points = map.getPoints();
        if(points.length > 0 && !points[points.length - 1].isSaved){
          map.removeLastPointAndMarker();
        }
        map.addPoint(new CustomPoint(lon, lat), this.coordinateService.getAdress(lon, lat));
        localStorage.setItem("points", JSON.stringify(map.getPoints()));
      });
  }

  public saveNewPoint(map: MapWithPoints): void{
    map.saveLastPoint();
  }

  public removeAllMarksAndTracks(map: MapWithPoints): void{
    localStorage.removeItem("points");
    localStorage.removeItem("trackProvided?");
    map.deleteAllPointsAndTracks();
  }

  public getMarksConnected(map: MapWithPoints): void{
    localStorage.setItem("trackProvided?", JSON.stringify(map.connectPoints()));
  }
}
