import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MapService} from "../../services/map.service";
import {MapWithPoints} from "../../data-entities/MapWithPoints";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy{
  protected map!: MapWithPoints;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.map = this.mapService.initialiseMap();
  }

  ngOnDestroy(): void {
    this.mapService.clickSubscription.unsubscribe();
  }

  @HostListener("window:beforeunload")
  updatePointsStorage(){
    localStorage.setItem("points", JSON.stringify(this.map.getPoints()));
  }

  public saveNewPoint(){
    this.mapService.saveNewPoint(this.map);
  }

  public clearAllMarksAndTracks(): void{
    this.mapService.removeAllMarksAndTracks(this.map);
  }

  public connectTheMarks(): void{
    this.mapService.getMarksConnected(this.map);
  }

}
