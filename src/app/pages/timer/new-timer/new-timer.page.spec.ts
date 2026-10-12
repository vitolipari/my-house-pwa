import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTimerPage } from './new-timer.page';

describe('NewTimerPage', () => {
  let component: NewTimerPage;
  let fixture: ComponentFixture<NewTimerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTimerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTimerPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
