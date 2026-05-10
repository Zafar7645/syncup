import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Nav } from '@/app/shared/nav/nav';
import { Auth } from '@/app/auth/services/auth';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<Auth>('Auth', ['getUserEmail', 'logout']);
    authServiceSpy.getUserEmail.and.returnValue('user@test.com');

    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── userInitial ─────────────────────────────────────────────────────────────

  describe('userInitial', () => {
    it('should be the uppercase first character of the user email', () => {
      expect(component.userInitial).toBe('U');
    });

    it('should be "?" when getUserEmail returns null', () => {
      // Change spy before creating a new component instance
      authServiceSpy.getUserEmail.and.returnValue(null);
      const noEmailComponent = TestBed.createComponent(Nav).componentInstance;
      expect(noEmailComponent.userInitial).toBe('?');
    });
  });

  // ── toggleMenu ──────────────────────────────────────────────────────────────

  describe('toggleMenu', () => {
    it('should open the menu when it is closed', () => {
      component.menuOpen = false;
      component.toggleMenu();
      expect(component.menuOpen).toBeTrue();
    });

    it('should close the menu when it is open', () => {
      component.menuOpen = true;
      component.toggleMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call authService.logout and navigate to /auth/login', () => {
      spyOn(router, 'navigate');
      component.logout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  // ── onDocumentClick ─────────────────────────────────────────────────────────

  describe('onDocumentClick', () => {
    it('should close the menu when clicking outside the nav element', () => {
      component.menuOpen = true;
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      component.onDocumentClick({ target: outsideElement } as unknown as MouseEvent);

      expect(component.menuOpen).toBeFalse();
      document.body.removeChild(outsideElement);
    });

    it('should keep the menu open when clicking inside the nav element', () => {
      component.menuOpen = true;
      component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);
      expect(component.menuOpen).toBeTrue();
    });

    it('should not change state when the menu is already closed', () => {
      component.menuOpen = false;
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      component.onDocumentClick({ target: outsideElement } as unknown as MouseEvent);

      expect(component.menuOpen).toBeFalse();
      document.body.removeChild(outsideElement);
    });
  });
});
