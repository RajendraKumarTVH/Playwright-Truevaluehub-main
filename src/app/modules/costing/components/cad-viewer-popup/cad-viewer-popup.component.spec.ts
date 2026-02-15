import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadViewerPopupComponent } from './cad-viewer-popup.component';

describe('CadViewerPopupComponent', () => {
  let component: CadViewerPopupComponent;
  let fixture: ComponentFixture<CadViewerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CadViewerPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CadViewerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
