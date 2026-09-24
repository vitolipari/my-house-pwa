import {Injectable} from '@angular/core';
import {
    AccessControlData,
    AccessEvaluationResult
} from '../models/access-control.models';
import {LoggedUser} from '../models/auth.models';

type CustomCheck = (user: LoggedUser, url: string) => boolean | Promise<boolean>;

@Injectable({
    providedIn: 'root'
})
export class AccessControlService {

    private readonly customChecks: Record<string, CustomCheck> = {
        ONLY_OWN_PROFILE: (user, url) => {
            const id = parseInt(url.split('/').pop() || '0');
            return user.id === id || user.roles?.includes('ADMIN');
        },

        ADMIN_OR_MANAGER: (user) => {
            // TODO ruoli da sistemare
            return user.roles?.includes('ADMIN') || user.roles?.includes('MANAGER');
        }
    };

    evaluateAccess(
        user: LoggedUser | null,
        url: string,
        config?: AccessControlData
    ): Promise<AccessEvaluationResult> {
        // le regole sono controllate in ordine: la prima che non passa decide il motivo del rifiuto
        return Promise.resolve().then((): AccessEvaluationResult | Promise<AccessEvaluationResult> => {
            if (!user) {
                return {
                    allowed: false,
                    reason: 'NOT_LOGGED'
                };
            }

            if (!config) {
                return {allowed: true};
            }

            // SAFE FALLBACKS
            const roles = user.roles ?? [];
            const permissions = user.permissions ?? [];
            // const flags = user.featureFlags ?? [];

            // OFFLINE
            if (config.allowOffline === false && !navigator.onLine) {
                return {
                    allowed: false,
                    reason: 'OFFLINE_BLOCKED'
                };
            }

            // STATO UTENTE
            if (config.requireEnabled && !user.enabled) {
                return {
                    allowed: false,
                    reason: 'DISABLED'
                };
            }

            // if (config.requireConfirmedEmail && !user.emailConfirmed) {
            //     return {
            //         allowed: false,
            //         reason: 'UNCONFIRMED_EMAIL'
            //     };
            // }

            // if (config.requireCompletedProfile && !user.profileCompleted) {
            //     return {
            //         allowed: false,
            //         reason: 'INCOMPLETE_PROFILE'
            //     };
            // }

            // if (config.requireActiveSubscription && !user.subscriptionActive) {
            //     return {
            //         allowed: false,
            //         reason: 'NO_SUBSCRIPTION'
            //     };
            // }

            // RUOLI ANY
            if (config.rolesAny?.length) {
                const ok = config.rolesAny.some(r => roles.includes(r));
                if (!ok) return {allowed: false, reason: 'FORBIDDEN'};
            }

            // RUOLI ALL
            if (config.rolesAll?.length) {
                const ok = config.rolesAll.every(r => roles.includes(r));
                if (!ok) return {allowed: false, reason: 'FORBIDDEN'};
            }

            // PERMESSI ANY
            if (config.permissionsAny?.length) {
                const ok = config.permissionsAny.some(p => permissions.includes(p));
                if (!ok) return {allowed: false, reason: 'FORBIDDEN'};
            }

            // PERMESSI ALL
            if (config.permissionsAll?.length) {
                const ok = config.permissionsAll.every(p => permissions.includes(p));
                if (!ok) return {allowed: false, reason: 'FORBIDDEN'};
            }

            // FEATURE FLAGS
            // if (config.requiredFeatureFlags?.length) {
            //     const ok = config.requiredFeatureFlags.every(f => flags.includes(f));
            //     if (!ok) return {allowed: false, reason: 'FORBIDDEN'};
            // }

            // CUSTOM
            if (config.customCheckKey) {
                const fn = this.customChecks[config.customCheckKey];
                if (!fn) return {allowed: false, reason: 'FORBIDDEN'};

                // la regola custom può essere anche asincrona
                return Promise.resolve(fn(user, url))
                    .then((result): AccessEvaluationResult => (
                        result ? {allowed: true} : {allowed: false, reason: 'FORBIDDEN'}
                    ));
            }

            return {allowed: true};
        });
    }

    resolveRedirect(reason: string, config?: AccessControlData): string {
        const r = config?.redirectTo;

        switch (reason) {
            case 'NOT_LOGGED':
                return r?.notLogged ?? '/access/sign-in';

            case 'DISABLED':
                return r?.disabled ?? '/account-disabled';

            case 'UNCONFIRMED_EMAIL':
                return r?.unconfirmedEmail ?? '/access/confirm';

            case 'INCOMPLETE_PROFILE':
                return r?.incompleteProfile ?? '/profile/complete';

            case 'NO_SUBSCRIPTION':
                return r?.noSubscription ?? '/subscription/upgrade';

            case 'OFFLINE_BLOCKED':
                return r?.offlineBlocked ?? '/home-empty';

            default:
                return r?.forbidden ?? '/unauthorized';
        }
    }
}
