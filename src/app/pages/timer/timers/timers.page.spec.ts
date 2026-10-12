import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimersPage } from './timers.page';

describe('TimersPage', () => {
  let component: TimersPage;
  let fixture: ComponentFixture<TimersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimersPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
