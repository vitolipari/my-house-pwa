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
        path: 'matter-bridge',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'ADD_HOUSE_DEVICES'
            }
        },
        loadComponent: () =>
            import('./pages/matter-bridge/matter-bridge.page').then(m => m.MatterBridgePage)
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
        path: 'rooms-page',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_ROOMS'
            }
        },
        loadComponent: () =>
            import('./pages/rooms/rooms.page').then(m => m.RoomsPage)
    },

    {
        path: 'room-page/:id',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_ROOM'
            }
        },
        loadComponent: () =>
            import('./pages/room/room.page').then(m => m.RoomPage)
    },

    {
        path: 'new-room',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: ['READ_ROOMS', 'READ_ROOM', 'CREATE_ROOMS']
            }
        },
        loadComponent: () =>
            // import('./pages/new-room/new-room.page').then(m => m.NewRoomPage)
            import('./pages/room/room.page').then(m => m.RoomPage)
    },

    {
        path: 'group-page/:id',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_GROUP'
            }
        },
        loadComponent: () =>
            import('./pages/group/group.page').then(m => m.GroupPage)
    },

    {
        path: 'new-group',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'CREATE_GROUPS'
            }
        },
        loadComponent: () =>
            import('./pages/new-group/new-group.page').then(m => m.NewGroupPage)
    },


    {
        path: 'timers-page',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_TIMERS'
            }
        },
        loadComponent: () =>
            import('./pages/timer/timers/timers.page').then(m => m.TimersPage)
    },

    {
        path: 'timer-page/:id',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: 'READ_TIMER',
                isReadOnly: true
            }
        },
        loadComponent: () =>
            // import('./pages/timer/timer/timer.page').then(m => m.TimerPage)
            import('./pages/timer/new-timer/new-timer.page').then(m => m.NewTimerPage)
    },

    {
        path: 'new-timer',
        canActivate: [routeAccessGuard],
        data: {
            accessControl: {
                permission: ['CREATE_TIMER', 'READ_TIMER', 'READ_TIMERS']
            }
        },
        loadComponent: () =>
            import('./pages/timer/new-timer/new-timer.page').then(m => m.NewTimerPage)
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
