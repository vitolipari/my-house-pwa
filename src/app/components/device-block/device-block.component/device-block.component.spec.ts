import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceBlockComponent } from './device-block.component';

describe('DeviceBlockComponent', () => {
  let component: DeviceBlockComponent;
  let fixture: ComponentFixture<DeviceBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceBlockComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
