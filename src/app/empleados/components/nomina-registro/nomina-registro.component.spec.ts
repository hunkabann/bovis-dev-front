import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominaRegistroComponent } from './nomina-registro.component';

describe('NominaRegistroComponent', () => {
  let component: NominaRegistroComponent;
  let fixture: ComponentFixture<NominaRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominaRegistroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NominaRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
