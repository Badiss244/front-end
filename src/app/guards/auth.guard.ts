import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userRole = authService.getUserRole().toLowerCase();
  const requiredRole = route.data['role']?.toLowerCase();

  // If not authenticated, redirect to login
  if (!authService.isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  // If route requires a role, check if user has the correct role
  if (requiredRole) {
    console.log('Required role:', requiredRole, 'User role:', userRole);
    if (userRole !== requiredRole) {
      console.log('Invalid role, redirecting to unauthorized');
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
}; 