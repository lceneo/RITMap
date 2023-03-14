import {Component, OnInit} from '@angular/core';
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

  ngOnInit(): void {
    this.map = this.mapService.initialiseMap();
  }

  public clearAllMarks(): void{
    this.mapService.removeAllMarks(this.map);
  }
}
