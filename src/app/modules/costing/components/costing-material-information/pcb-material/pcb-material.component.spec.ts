import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PCBMaterialComponent } from './pcb-material.component';

describe('PCBMaterialComponent', () => {
  let component: PCBMaterialComponent;
  let fixture: ComponentFixture<PCBMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PCBMaterialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PCBMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
