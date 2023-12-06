import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemasRegistroComponent } from './sistemas-registro.component';

describe('SistemasRegistroComponent', () => {
  let component: SistemasRegistroComponent;
  let fixture: ComponentFixture<SistemasRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SistemasRegistroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SistemasRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
