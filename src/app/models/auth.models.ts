export interface LoggedUser {
    id: number;
    username?: string;
    email: string;
    mobile: string;
    picture: string;
    roles: string | string[];
    permissions: string | string[];
    authorizations: string | string[];
    enabled?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    mobilenumber: string | number;
    profilePicture: string;
}

export interface EditProfileRequestType {
    id: number;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    fullName: string;
    mobilenumber: string | number;
    profilePicture: string;
}

export interface ConfirmRequest {
    email: string;
    code: string;
}

export interface RouteAccessConfig {
    // con un elenco servono tutti i permessi
    permission: string | string[];
    requiredRoles?: string[];
    requiredPermissions?: string[];
    requiredFeatureFlags?: string[];

    requireEnabled?: boolean;
    requireConfirmedEmail?: boolean;
    requireCompletedProfile?: boolean;
    requireActiveSubscription?: boolean;

    redirectTo?: {
        notLogged?: string;
        forbidden?: string;
        disabled?: string;
        unconfirmedEmail?: string;
        incompleteProfile?: string;
        noSubscription?: string;
    };
}
