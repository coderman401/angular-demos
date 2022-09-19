import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterImageComponent } from './filter-image.component';

describe('FilterImageComponent', () => {
  let component: FilterImageComponent;
  let fixture: ComponentFixture<FilterImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
