import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestProcessGraphicalComponent } from './best-process-graphical.component';

describe('BestProcessGraphicalComponent', () => {
  let component: BestProcessGraphicalComponent;
  let fixture: ComponentFixture<BestProcessGraphicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BestProcessGraphicalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BestProcessGraphicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
