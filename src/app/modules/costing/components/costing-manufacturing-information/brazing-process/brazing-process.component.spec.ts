import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrazingProcessComponent } from './brazing-process.component';

describe('BrazingProcessComponent', () => {
  let component: BrazingProcessComponent;
  let fixture: ComponentFixture<BrazingProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrazingProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrazingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
