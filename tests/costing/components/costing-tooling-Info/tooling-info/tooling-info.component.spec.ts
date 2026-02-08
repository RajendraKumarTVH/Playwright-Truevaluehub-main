import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolingInfoComponent } from './tooling-info.component';

describe('ToolingInfoComponent', () => {
  let component: ToolingInfoComponent;
  let fixture: ComponentFixture<ToolingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolingInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
