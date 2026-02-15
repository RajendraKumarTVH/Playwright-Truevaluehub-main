import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeShellPageComponent } from './home-shell-page.component';

describe('HomeShellPageComponent', () => {
  let component: HomeShellPageComponent;
  let fixture: ComponentFixture<HomeShellPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeShellPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeShellPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
