import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarRecursoComponent } from './reservar-recurso.component';

describe('ReservarRecursoComponent', () => {
  let component: ReservarRecursoComponent;
  let fixture: ComponentFixture<ReservarRecursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarRecursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarRecursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
