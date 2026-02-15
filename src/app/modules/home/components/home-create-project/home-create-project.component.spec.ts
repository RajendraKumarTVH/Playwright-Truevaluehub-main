import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCreateProjectComponent } from './home-create-project.component';

describe('HomeCreateProjectComponent', () => {
  let component: HomeCreateProjectComponent;
  let fixture: ComponentFixture<HomeCreateProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeCreateProjectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
