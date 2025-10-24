import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarEspaciosComponent } from './gestionar-espacios.component';

describe('GestionarEspaciosComponent', () => {
  let component: GestionarEspaciosComponent;
  let fixture: ComponentFixture<GestionarEspaciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarEspaciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarEspaciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
