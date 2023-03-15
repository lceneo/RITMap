import Map, { MapOptions } from "ol/Map.js";
import {CustomPoint} from "./CustomPoint";
import {Observable} from "rxjs";
import LayerVector from "ol/layer/Vector";
import SourceVector from "ol/source/Vector";
import {Feature} from "ol";
import {LineString, Point} from "ol/geom";
import {fromLonLat} from "ol/proj";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

export class MapWithPoints extends Map {
  private points: CustomPoint[] = [];
  private markersLayer!: LayerVector<SourceVector<any>>;
  private lastAddedFeature!: Feature<Point>;

  constructor(options: MapOptions | undefined) {
    super(options);
    this.markersLayer = new LayerVector(
      {
        source: new SourceVector(
          {
            features: []
          })
      });
    this.addLayer(this.markersLayer);
  }

  public addPoint(point: CustomPoint, adressObservable?: Observable<string>): void {
    const newMarker = new Feature({
      geometry: new Point(fromLonLat([point.longitude, point.latitude])),
    });
    this.lastAddedFeature = newMarker;
    newMarker.setStyle(new Style({
      image: new Icon({
        src: point.isSaved? "../../assets/img/saved-marker.svg" : "../../assets/img/unsaved-marker.svg", scale: 0.03})
    }));
    this.markersLayer.getSource()!.addFeature(newMarker);
    this.points.push(point);
    if (adressObservable !== undefined) {
      adressObservable.subscribe(v => point.adress = v);
    }
  }

  public saveLastPoint(): void{
    this.points[this.points.length - 1].isSaved = true;
    this.lastAddedFeature.setStyle(new Style({
      image: new Icon({
        src: "../../assets/img/saved-marker.svg", scale: 0.03})
    }));
  }

  public getPoints(): CustomPoint[] {
    return this.points;
  }

  public deleteAllPointsAndTracks(): void {
    if (this.points.length === 0)
      return;
    this.markersLayer.getSource()!.clear();
    this.points = [];
  }

  public removeLastPointAndMarker(): void{
    this.points.pop();
    this.markersLayer.getSource()?.removeFeature(this.lastAddedFeature);
  }

  public connectPoints(pointsNumber: number = this.points.length): number{
    let isSuccessful = false;
    for (let i = 0; i < pointsNumber - 1; i++) {
      if(!this.points[i].isSaved || !this.points[i + 1].isSaved)
        return i + 1;
      const fPointLocation = fromLonLat([this.points[i].longitude, this.points[i].latitude]);
      const sPointLocation = fromLonLat([this.points[i+1].longitude, this.points[i+1].latitude]);
      const feature = new Feature({
        geometry: new LineString([fPointLocation, sPointLocation])
      });
      this.markersLayer.getSource()!.addFeature(feature);
      isSuccessful = true;
    }
    return isSuccessful ? this.points.length : 0;
  }
}
