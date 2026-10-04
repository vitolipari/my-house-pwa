import {inject, Injectable} from '@angular/core';
import x509 from 'js-x509-utils';
import {arrayBufferToBase64Url, base64UrlToUint8Array, textToUint8Array, uint8ArrayToText} from './securecon.utility';
import {DER} from 'js-x509-utils/dist/typedef';
import {ApiUrlService} from '../../services/api-url-service';


export type SecureConResponseType = {
    payload: any,
    data: {
        sessionId: string;
        publicKey: JsonWebKey;
        salt: string
    }
}

export type SessionDataPackType = {
    id: string;
    key: CryptoKey;
    salt: string;
    // iv: Uint8Array<ArrayBuffer>;
    secret: ArrayBuffer;
    privateKey: CryptoKey;
    publicKey: JsonWebKey;
    jsonPublicKey: JsonWebKey;
    outerPublicKey: CryptoKey;
};


@Injectable({
    providedIn: 'root',
})
export class SecureCon {

    apiUrlService = inject(ApiUrlService);
    baseUrl: string = '';

    session: Partial<SessionDataPackType> = {};

    /**
     * Genera coppia di chiavi private/public necessarie per la generazione della
     * chiave di sessione (shared_key) per ECDH
     */
    generateKeys = (): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> => (

        crypto.subtle.generateKey({
                    name: 'ECDH',
                    namedCurve: 'P-256'
                },
                true,
                ['deriveBits']
            )
            .then((keyPair: CryptoKeyPair) => {

                return (
                    Promise.all([
                            crypto.subtle.exportKey('jwk', keyPair.privateKey),
                            crypto.subtle.exportKey('jwk', keyPair.publicKey)
                        ])
                        .then((keys: JsonWebKey[]) => ({
                            privateKey: keys[0],
                            publicKey: keys[1]
                        }))
                        .catch((e: any) => {
                            console.log('errore in generateKeys: export delle chiavi');
                            console.log(e);
                            return Promise.reject(e);
                        })
                )

            })
            .catch((e: any) => {
                console.log('errore in generateKeys');
                console.log(e);
                return Promise.reject(e);
            })

    )

    /**
     *
     */
    generateX509PemCert = (): Promise<{ certificate: string, privateKey: JsonWebKey, publicKey: JsonWebKey }> => {

        return (
            Promise.resolve()

                .then(() => this.generateKeys())

                .then(({privateKey, publicKey}: { privateKey: JsonWebKey, publicKey: JsonWebKey }) => {

                    let issuer = {
                        countryName: 'IT',
                        stateOrProvinceName: 'Sicily',
                        localityName: 'Mazara del Vallo',
                        organizationName: 'LipariStudios'
                    };

                    return (
                        x509.fromJwk(
                                publicKey,
                                privateKey,
                                'pem',
                                {
                                    signature: 'ecdsa-with-sha256', // signature algorithm
                                    days: 365, // expired in days
                                    issuer: issuer, // issuer
                                    subject: issuer // assume that issuer = subject, i.e., self-signed certificate
                                }
                            )
                            .then((cert: string | DER) => ({certificate: cert as string, privateKey, publicKey}))
                            .catch(e => {
                                console.log('errore in generateX509PemCert: x509.fromJwk');
                                console.log(e);
                                return Promise.reject(e);
                            })

                    )
                })
                .catch(e => {
                    console.log('errore in generateX509PemCert');
                    console.log(e);
                    return Promise.reject(e);
                })
        )
    }


    /**
     *
     */
    generateX509PemCertificate = (): Promise<string | DER> => {

        return (
            Promise.resolve()

                .then(() => this.generateKeys())

                .then(({privateKey, publicKey}: { privateKey: JsonWebKey, publicKey: JsonWebKey }) => {

                    let issuer = {
                        countryName: 'IT',
                        stateOrProvinceName: 'Sicily',
                        localityName: 'Mazara del Vallo',
                        organizationName: 'LipariStudios'
                    };

                    return (
                        x509.fromJwk(
                                publicKey,
                                privateKey,
                                'pem',
                                {
                                    signature: 'ecdsa-with-sha256', // signature algorithm
                                    days: 365, // expired in days
                                    issuer: issuer, // issuer
                                    subject: issuer // assume that issuer = subject, i.e., self-signed certificate
                                }
                            )
                    )
                })
                .catch(e => {
                    console.log('errore in generateX509PemCertificate');
                    console.log(e);
                    return Promise.reject(e);
                })
        )
    }


    /**
     *
     */
    handshake = (): Promise<any> => {
        return (
            Promise.resolve()

                // start ---------------------------------------------------------------------------------------------------------------------------------------
                .then(() => {
                    console.log('HANDSHAKE');

                    return (
                        this.apiUrlService.resolveApiBaseUrl()
                            .then((baseUrl: string) => {
                                this.baseUrl = baseUrl;
                                this.session = {};
                                return true;
                            })
                            .catch((e: any) => {
                                console.log('errore in handshake: resolveApiBaseUrl');
                                console.log(e);
                                return Promise.reject(e);
                            })
                    )
                    ;

                })

                // generate certificate ---------------------------------------------------------------------------------------------------------------------------
                .then(() => this.generateX509PemCert())


                // handshake call --------------------------------------------------------------------------------------------------------------------------------------------------
                .then(({certificate, privateKey, publicKey}: {
                    certificate: string,
                    privateKey: JsonWebKey,
                    publicKey: JsonWebKey
                }) => (
                    fetch(
                        `${ this.baseUrl }/session/handshake`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/plain'
                            },
                            body: certificate
                        }
                    )
                        .then((response: any) => response.json())
                        .then((response: SecureConResponseType) => {

                            // console.log( response );

                            this.session.publicKey = publicKey;
                            this.session.id = response.data.sessionId;
                            this.session.salt = response.data.salt;

                            return ({
                                rawServerPublicKey: response.data.publicKey,
                                privateKey,
                                publicKey
                            });
                        })
                        .catch(e => {
                            console.log('errore in handshake: chiamata /session/handshake');
                            console.log(e);
                            return Promise.reject(e);
                        })
                ))

                // prepare keys -------------------------------------------------------------------------------------------------------------------
                .then(({rawServerPublicKey, privateKey, publicKey}: {
                    rawServerPublicKey: JsonWebKey,
                    privateKey: JsonWebKey,
                    publicKey: JsonWebKey
                }) => {

                    return (
                        Promise.all([
                            crypto.subtle.importKey(
                                'jwk',
                                rawServerPublicKey,
                                {
                                    name: 'ECDH',
                                    namedCurve: 'P-256'
                                },
                                true,
                                []
                            ),
                            crypto.subtle.importKey(
                                'jwk',
                                privateKey,
                                {
                                    name: 'ECDH',
                                    namedCurve: 'P-256'
                                },
                                true,
                                ['deriveBits']
                            )
                        ])

                    )
                })


                // generate secret key ------------------------------------------------------------------------------------------------------------------------
                .then(([serverPublicKey, privateKey]: CryptoKey[]) => (

                    crypto.subtle.deriveBits(
                            {
                                name: 'ECDH',
                                public: serverPublicKey
                            },
                            privateKey,
                            256
                        )
                        .then((secret: ArrayBuffer) => {

                            this.session.outerPublicKey = serverPublicKey;
                            this.session.privateKey = privateKey;
                            this.session.secret = secret;

                            const bytes = new Uint8Array(secret);
                            let hexSessionKey: string =
                                Array
                                    .from(bytes)
                                    .map(b => b.toString(16).padStart(2, '0'))
                                    .join('')
                            ;
                            console.log(hexSessionKey);

                            return secret;

                        })
                        .catch((e: any) => {
                            console.log('errore in handshake: deriveBits della chiave di sessione');
                            console.log(e);
                            return Promise.reject(e);
                        })
                ))


                // generate encryptedData ----------------------------------------------------------------------
                .then((secret: ArrayBuffer) => {


                    let rawSalt = (this.session.salt || '').replace(/-/g, '+').replace(/_/g, '/');
                    while (rawSalt.length % 4) {
                        rawSalt += '=';
                    }
                    const binary = atob(rawSalt);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    const salt =  bytes.buffer;

                    return (
                        crypto.subtle.importKey(
                                'raw',
                                secret,
                                'HKDF',
                                false,
                                ['deriveKey']
                            )
                            .then((hkdfBaseKey: CryptoKey) => {

                                const hkdfSalt = crypto.getRandomValues(new Uint8Array(16));

                                return (
                                    crypto.subtle.deriveKey(
                                            {
                                                name: 'HKDF',
                                                hash: 'SHA-256',
                                                salt: salt,
                                                info: textToUint8Array('kEnc:v1') as BufferSource
                                            },
                                            hkdfBaseKey,
                                            {
                                                name: 'AES-GCM',
                                                length: 256
                                            },
                                            true,
                                            ['encrypt', 'decrypt']
                                        )
                                        .then((kEnc: CryptoKey) => {
                                            // this.session.iv = hkdfSalt;
                                            this.session.key = kEnc;
                                            return this.session;
                                        })
                                        .catch((e: any) => {
                                            console.log('errore in handshake: deriveKey di kEnc');
                                            console.log(e);
                                            return Promise.reject(e);
                                        })
                                )
                            })
                    )
                })


                .catch((e: any) => {
                    console.log('errore in handshake');
                    console.log(e);
                    return Promise.reject(e);
                })
        );
    };



    encryptBody(body: any): Promise<{iv: string; payload: string}> {
        const plaintext = textToUint8Array(JSON.stringify(body)) as BufferSource;
        const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;

        return (
            crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                (this.session as SessionDataPackType).key,
                plaintext
            )
                .then((encrypted: ArrayBuffer) => {
                    // return arrayBufferToBase64Url(encrypted);
                    return {
                        iv: arrayBufferToBase64Url(iv.buffer),
                        payload: arrayBufferToBase64Url(encrypted)
                    };
                })
                .catch((e: any) => {
                    console.log('errore in encryptBody');
                    console.log(e);
                    return Promise.reject(e);
                })
        );

    }


    decryptResponse(kEnc: CryptoKey, payload: {iv: string; ciphertext: string;}): Promise<any> {

        const iv = base64UrlToUint8Array(payload.iv) as BufferSource;
        const ciphertext = base64UrlToUint8Array(payload.ciphertext) as BufferSource;

        return (
            crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                kEnc,
                ciphertext
            )
                .then((decrypted: any) => {
                    const json = uint8ArrayToText(new Uint8Array(decrypted));
                    return JSON.parse(json);
                })
                .catch((e: any) => {
                    console.log('errore in decryptResponse');
                    console.log(e);
                    return Promise.reject(e);
                })
        );

    }


    generateJwtToken = (payload: any): Promise<string> => {




        // chiave
        const bbytes = new Uint8Array(this.session.secret || []);
        let binary = '';
        for (let i = 0; i < bbytes.length; i++) {
            binary += String.fromCharCode(bbytes[i]);
        }
        let b64SessionKey: string = btoa(binary);

        const now = Math.floor(Date.now() / 1000);

        payload.iat = now;
        // finestra breve: ogni richiesta ha il proprio token, il server ne accetta ciascuno una volta
        payload.exp = now + 120;
        payload.jti = crypto.randomUUID();

        const json = JSON.stringify(payload);

        const encodedPayload = btoa(json)
            .replace(/\+/g,'-')
            .replace(/\//g,'_')
            .replace(/=/g,'');


        const jwtHeader =
            btoa( JSON.stringify({"alg": "HS256", "typ": "JWT"}) )
                .replace(/\+/g,'-')
                .replace(/\//g,'_')
                .replace(/=/g,'')
        ;


        // console.log('jwt token key');
        // console.log(b64SessionKey + '@' + now);

        return (

            // 3 importa chiave HMAC
            crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(b64SessionKey + '@' + now),
                {
                    name: 'HMAC',
                    hash: 'SHA-256'
                },
                false,
                ['sign']
            )

                .then((signatureKey: CryptoKey) => (
                    crypto.subtle.sign(
                        'HMAC',
                        signatureKey,
                        new TextEncoder().encode(jwtHeader +'.'+ encodedPayload)
                    )
                ))

                .then((signatureBuffer: ArrayBuffer) => {

                    // 5 signature in base64url
                    const signature = btoa(
                        String.fromCharCode(...new Uint8Array(signatureBuffer))
                    )
                    .replace(/\+/g,'-')
                    .replace(/\//g,'_')
                    .replace(/=/g,'');

                    // 6 token finale


                    return `${ jwtHeader }.${encodedPayload}.${signature}`;


                })
                .catch((e: any) => {
                    console.log('errore in generateJwtToken');
                    console.log(e);
                    return Promise.reject(e);
                })
        );


    }




    decryptBody(iv: string, payload: string) {

        const ivBytes = base64UrlToUint8Array(iv) as BufferSource;
        const encrypted = base64UrlToUint8Array(payload) as BufferSource;


        return (
            crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivBytes
                },
                this.session.key!,
                encrypted
            )
            .then((decrypted: any) => JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted))))
            .catch((e: any) => {
                console.log('errore in decryptBody');
                console.log(e);
                return Promise.reject(e);
            })
        )


    }
}
