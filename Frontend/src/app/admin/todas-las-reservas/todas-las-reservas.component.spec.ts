import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodasLasReservasComponent } from './todas-las-reservas.component';

describe('TodasLasReservasComponent', () => {
  let component: TodasLasReservasComponent;
  let fixture: ComponentFixture<TodasLasReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodasLasReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodasLasReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
