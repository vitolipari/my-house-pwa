
// permesso del catalogo, come nel Core (GET /permissions)
export type PermissionType = {
    name: string;
    description: string;
};

// richiesta di permessi (GET /grant-permission-requests?id=, PUT /grant-permission-request/:requestID).
// confirmedPermissions sono i permessi concessi da chi ha confermato: vuoto finché nessuno conferma
export type GrantRequestType = {
    id: number;
    subscriber: number;
    subscriberName: string;
    exp: string;                    // AAAA-MM-GG, ultimo giorno valido
    permissions: PermissionType[];
    confirmedPermissions: string[];
    delegator: number | null;
};

// concessione di permessi (PUT /delegate-permission/:delegationID): subscriber è chi l'ha ricevuta
export type DelegationType = {
    id: number;
    delegator: number;
    delegatorName: string;
    exp: string;                    // AAAA-MM-GG, ultimo giorno valido
    permissions: PermissionType[];
    subscriber: number | null;
};
