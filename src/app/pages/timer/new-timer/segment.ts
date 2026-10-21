export class Segment {
  minuteIndex!: number;
  width!: number;
  height!: number;
  active: boolean = false;
}


// un segmento è acceso se almeno un suo minuto è acceso: cambiando scala le sezioni già
// impostate restano visibili anche se non iniziano al bordo del nuovo segmento
export const isSegmentActive = (bits: boolean[], minuteIndex: number, minuteScale: number): boolean => {
  let isActive: boolean = false;
  for( let m = minuteIndex; m < (minuteIndex + minuteScale); m++ ) {
    if( !!bits[m] ) {
      isActive = true;
    }
  }
  return isActive;
}
