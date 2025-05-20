import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string>('');
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private cookieService: CookieService) {
    // Check if user is logged in from JWT token
    const token = this.cookieService.get('jwt_token');
    const isLoggedIn = !!token;
    this.isAuthenticatedSubject.next(isLoggedIn);
    
    if (isLoggedIn) {
      const role = this.getRoleFromToken(token);
      this.userRoleSubject.next(role);
    }
  }

  private getRoleFromToken(token: string): string {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken = JSON.parse(window.atob(base64));
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
    } catch (error) {
      console.error('Erreur ', error);
      return '';
    }
  }

  login(token: string) {
    this.cookieService.set('jwt_token', token, 1, '/', undefined, true, 'Strict');
    const role = this.getRoleFromToken(token);
    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(role);
  }

  logout() {
    this.cookieService.delete('jwt_token');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserRole(): string {
    return this.userRoleSubject.value;
  }
} 