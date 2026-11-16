import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth';
import {ZoneType} from '../pages/devices/devices.models';
import {HttpClient} from '@angular/common/http';
import {PermissionType} from '../pages/profile/permission.models';
import {ProfileType} from '../pages/user/profile.models';


export type RoleType = {
    name: string;
    description: string;
    permissions: PermissionType[];
}



export type RolePermissionType = {
    "name": string;
    "description": string;
    "permissions": {
        "name": string;
        "description": string;
    }[];
}


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly authService = inject<AuthService>(AuthService);
    private readonly http = inject(HttpClient);
    private readonly baseUrl = '/api/core';

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

        // le autorizzazioni arrivano dal Core come PERMESSO@AAAAMMGG, già senza quelle scadute
        const authorizations = (Array.isArray(user.authorizations) ? user.authorizations : [user.authorizations])
            .map((authorization: string) => authorization.split('@')[0]);

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


    getAllPermissions() {
        return this.http.get<{name: string; description: string;}[]>(`${this.baseUrl}/permissions`);
    }

    getAllRoles() {
        return this.http.get<RolePermissionType[]>(`${this.baseUrl}/roles`);
    }

    editUserRole( user: ProfileType, roles: RolePermissionType[]) {
        return this.http.put<unknown>(`${this.baseUrl}/user/${ user.id }/roles`, {roles: roles});
    }

}
