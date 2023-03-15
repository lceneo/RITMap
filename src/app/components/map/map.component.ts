import {Component, HostListener, OnInit} from '@angular/core';
import {MapService} from "../../services/map.service";
import {MapWithPoints} from "../../data-entities/MapWithPoints";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit{
  protected map!: MapWithPoints;

  constructor(private mapService: MapService) {}

  @HostListener("window:beforeunload")
  updatePointsStorage(){
    localStorage.setItem("points", JSON.stringify(this.map.getPoints()));
  }

  ngOnInit(): void {
    this.map = this.mapService.initialiseMap();
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
