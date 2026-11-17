import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeMeteredComponent } from './gauge-metered.component';

describe('GaugeMeteredComponent', () => {
  let component: GaugeMeteredComponent;
  let fixture: ComponentFixture<GaugeMeteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaugeMeteredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaugeMeteredComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
