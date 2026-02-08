import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePcbBomModalComponent } from './delete-pcb-bom-modal.component';

describe('DeletePcbBomModalComponent', () => {
  let component: DeletePcbBomModalComponent;
  let fixture: ComponentFixture<DeletePcbBomModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePcbBomModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePcbBomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
