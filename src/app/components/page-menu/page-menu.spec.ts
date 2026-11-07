import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMenu } from './page-menu';

describe('PageMenu', () => {
  let component: PageMenu;
  let fixture: ComponentFixture<PageMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
