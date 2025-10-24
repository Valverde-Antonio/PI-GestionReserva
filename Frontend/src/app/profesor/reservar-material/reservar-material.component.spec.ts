import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarMaterialComponent } from './reservar-material.component';

describe('ReservarMaterialComponent', () => {
  let component: ReservarMaterialComponent;
  let fixture: ComponentFixture<ReservarMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarMaterialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservarMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
