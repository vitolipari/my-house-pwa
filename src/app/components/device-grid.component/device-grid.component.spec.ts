import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceGridComponent } from './device-grid.component';

describe('DeviceGridComponent', () => {
  let component: DeviceGridComponent;
  let fixture: ComponentFixture<DeviceGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
