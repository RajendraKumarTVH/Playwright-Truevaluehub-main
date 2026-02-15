import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchShellPageComponent } from './search-shell-page.component';

describe('SearchShellPageComponent', () => {
  let component: SearchShellPageComponent;
  let fixture: ComponentFixture<SearchShellPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchShellPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchShellPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
