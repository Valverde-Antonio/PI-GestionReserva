import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoReservasComponent } from './historico-reservas.component';

describe('HistoricoReservasComponent', () => {
  let component: HistoricoReservasComponent;
  let fixture: ComponentFixture<HistoricoReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
