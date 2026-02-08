import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomMoveComponent } from './bom-move.component';

describe('BomMoveComponent', () => {
  let component: BomMoveComponent;
  let fixture: ComponentFixture<BomMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomMoveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BomMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
