import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomListBlockComponent } from './room-list-block.component';

describe('RoomListBlockComponent', () => {
  let component: RoomListBlockComponent;
  let fixture: ComponentFixture<RoomListBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomListBlockComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
