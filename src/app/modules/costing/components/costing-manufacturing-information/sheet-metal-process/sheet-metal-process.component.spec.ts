import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetMetalProcessComponent } from './sheet-metal-process.component';

describe('SheetMetalProcessComponent', () => {
  let component: SheetMetalProcessComponent;
  let fixture: ComponentFixture<SheetMetalProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheetMetalProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SheetMetalProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
