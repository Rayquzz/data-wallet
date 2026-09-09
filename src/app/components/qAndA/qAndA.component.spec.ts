import { ComponentFixture, TestBed } from '@angular/core/testing';

import { qAndAComponent } from './qAndA.component';

describe('qAndAComponent', () => {
  let component: qAndAComponent;
  let fixture: ComponentFixture<qAndAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [qAndAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(qAndAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
