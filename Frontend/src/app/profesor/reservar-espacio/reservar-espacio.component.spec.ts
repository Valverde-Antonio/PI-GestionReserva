import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarEspacioComponent } from './reservar-espacio.component';

describe('ReservarEspacioComponent', () => {
  let component: ReservarEspacioComponent;
  let fixture: ComponentFixture<ReservarEspacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarEspacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarEspacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
