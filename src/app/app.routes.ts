import {Routes} from '@angular/router';
import {routeAccessGuard} from './guards/route-access.guard';
import {guestGuard} from './guards/guest.guard';
import {NewDevicePage} from './pages/new-device/new-device.page';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/splash/splash.page').then(m => m.SplashPage)
    },

    {
        path: 'access',
        loadComponent: () =>
            import('./pages/access/access.page').then(m => m.AccessPage),
        children: [
            {
                path: 'sign-in',
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./pages/sign-in/signin.page').then(m => m.SignInPage)
            },
            {
                path: 'sign-up',
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./pages/sign-up/signup.page').then(m => m.SignUpPage)
            },
            // {
            //     path: 'confirm',
            //     loadComponent: () =>
            //         import('./pages/confirm-signup/confirm-signup.page').then(m => m.ConfirmSignupPage)
            // },
            // {
            //     path: 'forgot-password',
            //     loadComponent: () =>
            //         import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
            // }
        ]
    },

    {
        path: 'dashboard',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                rolesAny: [],
                permission: 'ACCESS_DASHBOARD'
                // requireEnabled: true,
                // requireConfirmedEmail: true
            }
        },
        loadComponent: () =>
            import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
    },

    {
        path: 'users-page',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                rolesAny: [],
                permission: 'LIST_USERS'
                // requireEnabled: true,
                // requireConfirmedEmail: true
            }
        },
        loadComponent: () =>
            import('./pages/users-page/users.page').then(m => m.UsersPage)
    },

    {
        path: 'devices-page',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_HOUSE_DEVICES'
            }
        },
        loadComponent: () =>
            import('./pages/devices/devices.page').then(m => m.DevicesPage)
    },

    {
        path: 'new-device',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'ADD_HOUSE_DEVICES'
            }
        },
        loadComponent: () =>
            import('./pages/new-device/new-device.page').then(m => m.NewDevicePage)
    },

    {
        path: 'device-details/:id',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_HOUSE_DEVICES_DETAILS'
            }
        },
        loadComponent: () =>
            import('./pages/device-details/device-details.page').then(m => m.DeviceDetailsPage)
    },

    {
        path: 'waste-collection',
        canActivate: [routeAccessGuard],
        loadComponent: () =>
            import('./pages/waste-collection/waste-collection.page').then(m => m.WasteCollectionPage)
    },

    {
        path: 'admin',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                rolesAny: ['ADMIN'],
                requireEnabled: true,
                requireConfirmedEmail: true,
                allowOffline: false
            }
        },
        loadComponent: () =>
            import('./pages/admin/admin.page').then(m => m.AdminPage)
    },

    {
        path: 'profile',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                customCheckKey: 'ONLY_OWN_PROFILE',
                permission: 'ACCESS_PROFILE_PAGE'
            }
        },
        children: [
            {
                path: 'page',
                canActivate: [guestGuard],
                loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
            }
        ]
    },

    {
        path: 'unauthorized',
        loadComponent: () =>
            import('./pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedComponent)
    },

    {
        path: 'error',
        loadComponent: () =>
            import('./pages/error/error.page').then(m => m.ErrorPage)
    },

    {
        path: '**',
        redirectTo: 'access/sign-in'
    }
];
