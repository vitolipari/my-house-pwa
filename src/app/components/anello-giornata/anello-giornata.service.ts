import { Injectable } from '@angular/core';

export interface AlbaTramonto {
    alba: Date;
    tramonto: Date;
}


const RAD = Math.PI / 180;
// 90° più la rifrazione atmosferica e il raggio del disco solare: il sole "sorge" quando il bordo superiore tocca l'orizzonte
const ZENIT_ALBA_TRAMONTO = 90.833;

// Giorno dell'anno (1 = 1 gennaio) della data indicata
const giornoDellAnno = (data: Date): number =>
    Math.floor(
        (Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) - Date.UTC(data.getFullYear(), 0, 1)) / 86400000
    ) + 1;


@Injectable({
  providedIn: 'root',
})
export class AnelloGiornataService {



    // Istanti di alba e tramonto per un giorno e un punto GPS (formule NOAA, errore di 1–2 minuti).
    // Restituisce null nei giorni senza alba o senza tramonto (giorno o notte polare).
    calcolaAlbaTramonto = (data: Date, latitudine: number, longitudine: number): AlbaTramonto | null => {
        const anno = data.getFullYear();
        const bisestile = (anno % 4 === 0 && anno % 100 !== 0) || anno % 400 === 0;

        // anno frazionario, in radianti
        const g = 2 * Math.PI / (bisestile ? 366 : 365) * (giornoDellAnno(data) - 1);

        // equazione del tempo (minuti) e declinazione solare (radianti)
        const equazioneTempo = 229.18 * (
            0.000075
            + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
            - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g)
        );
        const declinazione = 0.006918
            - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
            - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
            - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);

        const cosAngoloOrario =
            Math.cos(ZENIT_ALBA_TRAMONTO * RAD) / (Math.cos(latitudine * RAD) * Math.cos(declinazione))
            - Math.tan(latitudine * RAD) * Math.tan(declinazione);

        if (cosAngoloOrario < -1 || cosAngoloOrario > 1) {
            // il sole non attraversa l'orizzonte in questo giorno
            return null;
        }

        const angoloOrario = Math.acos(cosAngoloOrario) / RAD;
        const mezzanotteUtc = Date.UTC(anno, data.getMonth(), data.getDate());

        // minuti dalla mezzanotte UTC
        const minutiAlba = 720 - 4 * (longitudine + angoloOrario) - equazioneTempo;
        const minutiTramonto = 720 - 4 * (longitudine - angoloOrario) - equazioneTempo;

        return {
            alba: new Date(mezzanotteUtc + minutiAlba * 60000),
            tramonto: new Date(mezzanotteUtc + minutiTramonto * 60000)
        };
    };



    // Ora decimale (06:45 → 6.75) di un istante nel fuso indicato, per esempio 'Europe/Rome'
    oraDecimaleNelFuso = (istante: Date, fuso: string): number => {
        const parti = new Intl.DateTimeFormat('it-IT', {
            timeZone: fuso,
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(istante);

        const ore = Number(parti.find((p) => p.type === 'hour')?.value);
        const minuti = Number(parti.find((p) => p.type === 'minute')?.value);
        return ore + minuti / 60;
    };








}
