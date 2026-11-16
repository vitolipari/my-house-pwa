export type ProfileType = {
    id: number;
    username?: string;
    email: string;
    mobile: string;
    picture: string;
    roles: string | string[];
    permissions: string | string[];
    authorizations: string | string[];
    photos?: string | string[];
    // roles: RoleType[];
    // permissions: PermissionType[];
    // authorizations: PermissionType[];
}


export const VOID_USER = {
    id: 0,
    username: 'non-name',
    email: 'no-email',
    mobile: '123',
    picture: '',
    roles: ['HOST'],
    permissions: [],
    authorizations: []
};
