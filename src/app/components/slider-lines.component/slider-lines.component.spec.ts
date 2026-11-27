import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderLinesComponent } from './slider-lines.component';

describe('SliderLinesComponent', () => {
  let component: SliderLinesComponent;
  let fixture: ComponentFixture<SliderLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderLinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderLinesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
