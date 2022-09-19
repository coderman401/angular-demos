import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit {

  // vars
  @Input() filter!: any;
  @Input() src!: any;
  @Input() selected!: any;
  @Output() applyFilter = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  clickOnFilter() {
    this.applyFilter.emit(this.filter);
  }

}
