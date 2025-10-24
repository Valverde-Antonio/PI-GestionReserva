import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarAulaComponent } from './reservar-aula.component';

describe('ReservarAulaComponent', () => {
  let component: ReservarAulaComponent;
  let fixture: ComponentFixture<ReservarAulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarAulaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarAulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
