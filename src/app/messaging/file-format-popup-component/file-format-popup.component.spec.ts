import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileFormatPopupComponent } from './file-format-popup-component';

describe('FileFormatPopupComponent', () => {
  let component: FileFormatPopupComponent;
  let fixture: ComponentFixture<FileFormatPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileFormatPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileFormatPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
