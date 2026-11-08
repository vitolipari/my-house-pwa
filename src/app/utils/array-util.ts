

export const getLastElementOr = (final: any, current: any) => current;


/**
 * Appiattisce un oggetto JSON in un array di coppie { "percorso.del.campo": valore },
 * una per ogni valore finale, a qualsiasi profondità; gli indici degli array entrano nel percorso
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

            // valore finale: stringa, numero, booleano, null, {} o []
            result.push({ [key]: value });

        })
    ;

    return result;

};

