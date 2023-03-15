import { Injectable } from '@angular/core';
import {Point} from 'ol/geom.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromEvent} from "rxjs";
import {Feature, MapBrowserEvent} from "ol";
import {fromLonLat, toLonLat} from "ol/proj";
import LayerVector from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';
import {MapWithPoints} from "../data-entities/MapWithPoints";
import {CustomPoint} from "../data-entities/CustomPoint";
import {CoordinateService} from "./coordinate.service";

@Injectable({
  providedIn: 'root'
})
export class MapService {

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
      });
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
    fromEvent<MapBrowserEvent<any>>(map, "click")
      .subscribe(v => {
        let [lon, lat] = toLonLat(v.coordinate);
        map.addPoint(new CustomPoint(lon, lat), this.coordinateService.getAdress(lon, lat));
        localStorage.setItem("points", JSON.stringify(map.getPoints()));
      });
  }

  public removeAllMarksAndTracks(map: MapWithPoints): void{
    localStorage.removeItem("points");
    localStorage.removeItem("trackProvided?");
    map.deleteAllPointsAndTracks();
  }

  public getMarksConnected(map: MapWithPoints): void{
    map.connectPoints();
    localStorage.setItem("trackProvided?", JSON.stringify(map.getPoints().length));
  }
}
