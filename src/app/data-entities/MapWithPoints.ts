import Map, { MapOptions } from "ol/Map.js";
import {CustomPoint} from "./CustomPoint";
import {Observable} from "rxjs";

export class MapWithPoints extends Map{
  private points: CustomPoint[] = [];
  constructor(options: MapOptions | undefined) {
    super(options);
  }

  public addPoint(point: CustomPoint, adressObservable?: Observable<string>): void{
    this.points.push(point);
    if(adressObservable !== undefined) {
      adressObservable.subscribe(v => point.adress = v);
    }
  }

  public getPoints(): CustomPoint[]{
    return this.points;
  }
  public deleteAllPoints(): void{
    if(this.points.length === 0)
      return;
    const layers = this.getLayers();
    this.points = [];
    for (let i = layers.getLength() - 1; i >= 1; i--)
      layers.removeAt(i);
  }
}
