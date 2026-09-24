import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomListBlockComponent } from './room-list-block.component';

describe('RoomListBlockComponent', () => {
  let component: RoomListBlockComponent;
  let fixture: ComponentFixture<RoomListBlockComponent>;

  beforeEach(() => (
    TestBed.configureTestingModule({
      imports: [RoomListBlockComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RoomListBlockComponent);
        component = fixture.componentInstance;
        return fixture.whenStable();
      })
  ));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
