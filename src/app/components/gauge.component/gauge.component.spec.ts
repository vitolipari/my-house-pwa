import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeComponent } from './gauge.component';

describe('GaugeComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
