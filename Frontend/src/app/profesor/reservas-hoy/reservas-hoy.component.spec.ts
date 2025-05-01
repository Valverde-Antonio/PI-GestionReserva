import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasHoyComponent } from './reservas-hoy.component';

describe('ReservasHoyComponent', () => {
  let component: ReservasHoyComponent;
  let fixture: ComponentFixture<ReservasHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasHoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
