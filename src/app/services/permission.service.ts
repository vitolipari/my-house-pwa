import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly authService = inject<AuthService>(AuthService);

  hasRole(role: string): boolean {
    const user = this.authService.getLoggedUser();
    return !!user?.roles?.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) {
      return false;
    }

    return roles.some(role => user.roles.includes(role));
  }

    hasPermission(permission: string): boolean {
        const user = this.authService.getLoggedUser();

        if (!user) {
            return false;
        }

        const permissions = Array.isArray(user.permissions)
            ? user.permissions
            : [user.permissions];

        const authorizations = Array.isArray(user.authorizations)
            ? user.authorizations
            : [user.authorizations];

        return permissions.includes(permission)
            || authorizations.includes(permission);
    }

  hasAnyPermission(permissions: string[]): boolean {
    const user = this.authService.getLoggedUser();
    if (!user) {
      return false;
    }

    return permissions.some(permission => user.permissions.includes(permission));
  }

  // hasFeatureFlag(flag: string): boolean {
  //   const user = this.authService.getLoggedUser();
  //   return !!user?.featureFlags?.includes(flag);
  // }

  // hasAnyFeatureFlag(flags: string[]): boolean {
  //   const user = this.authService.getLoggedUser();
  //   if (!user) {
  //     return false;
  //   }
  //
  //   return flags.some(flag => user.featureFlags.includes(flag));
  // }
}
