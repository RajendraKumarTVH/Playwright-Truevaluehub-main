import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCableProcessComponent } from './custom-cable-process.component';

describe('CustomCableProcessComponent', () => {
  let component: CustomCableProcessComponent;
  let fixture: ComponentFixture<CustomCableProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomCableProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCableProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
