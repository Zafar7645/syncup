import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    httpMock.expectOne('/auth/profile').flush({ id: 1, name: 'Test', email: 'test@test.com' });
    expect(component).toBeTruthy();
  });
});
