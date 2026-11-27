import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressLinesBlocksComponent } from './progress-lines-blocks.component';

describe('ProgressLinesBlocksComponent', () => {
  let component: ProgressLinesBlocksComponent;
  let fixture: ComponentFixture<ProgressLinesBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressLinesBlocksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressLinesBlocksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
