import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarRecursosComponent } from './gestionar-recursos.component';

describe('GestionarRecursosComponent', () => {
  let component: GestionarRecursosComponent;
  let fixture: ComponentFixture<GestionarRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarRecursosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
