import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BopInfoComponent } from './bop-info.component';

describe('BopInfoComponent', () => {
  let component: BopInfoComponent;
  let fixture: ComponentFixture<BopInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BopInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BopInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
