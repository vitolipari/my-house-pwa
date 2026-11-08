

export const getLastElementOr = (final: any, current: any) => current;


/**
 * Appiattisce un oggetto JSON in un array di coppie { "percorso.del.campo": valore },
 * una per ogni valore finale, a qualsiasi profondità; gli indici degli array entrano nel percorso,
 * oggetti e array vuoti valgono null
 */
export const flattenToKeyValue = (obj: any, prefix: string = ''): { [key: string]: any }[] => {

    let result: { [key: string]: any }[] = [];

    Object.keys( obj )
        .forEach( (field: string) => {

            let key: string = ( prefix === '' ) ? field : prefix +'.'+ field;
            let value: any = obj[ field ];
            let isContainer: boolean = ( !!value && typeof value === 'object' );

            // oggetto o array con qualcosa dentro: si scende di un livello
            if( isContainer && Object.keys( value ).length > 0 ) {
                result.push( ...flattenToKeyValue( value, key ) );
                return;
            }

            // oggetto o array vuoto: nessun dato, quindi null (un {} nel template si legge [object Object])
            if( isContainer ) {
                result.push({ [key]: null });
                return;
            }

            // valore finale: stringa, numero, booleano o null
            result.push({ [key]: value });

        })
    ;

    return result;

};

