import Map, { MapOptions } from "ol/Map.js";
import {CustomPoint} from "./CustomPoint";
import {interval, Observable, Subscription, take} from "rxjs";
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
  private tracksLayer!: LayerVector<SourceVector<any>>;
  private lastAddedFeature!: Feature<Point>;
  private trackSubscription!: Subscription;

  constructor(options: MapOptions | undefined, private markerImgURL?: string) {
    super(options);
    this.markersLayer = new LayerVector(
      {
        source: new SourceVector(
          {
            features: []
          })
      });
    this.tracksLayer = new LayerVector(
      {
        source: new SourceVector(
          {
            features: []
          })
      });
    this.addLayer(this.markersLayer);
    this.addLayer(this.tracksLayer);
  }

  public addPoint(point: CustomPoint, adressObservable?: Observable<string>): void {
    const newMarker = new Feature({
      geometry: new Point(fromLonLat([point.longitude, point.latitude])),
    });
    this.lastAddedFeature = newMarker;
    newMarker.setStyle(new Style({
      image: new Icon({
        src: this.markerImgURL, scale: 0.03, color: point.isSaved ? undefined : "#413c3c"})
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
        src: this.markerImgURL, scale: 0.03})
    }));
  }

  public getPoints(): CustomPoint[] {
    return this.points;
  }

  public deleteAllPointsAndTracks(): void {
    if (this.points.length === 0)
      return;
    if(this.trackSubscription !== undefined)
      this.trackSubscription.unsubscribe();
    this.markersLayer.getSource()!.clear();
    this.tracksLayer.getSource()!.clear();
    this.points = [];
  }

  public removeLastPointAndMarker(): void{
    this.points.pop();
    this.markersLayer.getSource()?.removeFeature(this.lastAddedFeature);
  }

  public connectPoints(pointsNumber: number = this.points.length): number{
    if(this.trackSubscription !== undefined)
      this.trackSubscription.unsubscribe();
    this.tracksLayer.getSource()!.clear();
    const featuresToAdd: Feature[] = [];
    let returnValue = 0;
    let isSuccessful = false;
    for (let i = 0; i < pointsNumber - 1; i++) {
      if(!this.points[i].isSaved || !this.points[i + 1].isSaved) {
        returnValue = i + 1;
        break;
      }
      const fPointLocation = fromLonLat([this.points[i].longitude, this.points[i].latitude]);
      const sPointLocation = fromLonLat([this.points[i+1].longitude, this.points[i+1].latitude]);
      const feature = new Feature({
        geometry: new LineString([fPointLocation, sPointLocation])
      });
      featuresToAdd.push(feature);
      isSuccessful = true;
    }
    this.trackSubscription = interval(1500)
      .pipe(take(featuresToAdd.length))
      .subscribe(i => this.tracksLayer.getSource()!.addFeature(featuresToAdd[i]));
    return isSuccessful ? this.points.length : returnValue;
  }
}
