export const base58Alphabet    = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const base64alphabet    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
export const hexAlphabet       = "0123456789abcdef";
// export const base64alphabet    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export const base58AlphabetRegex = /^[1-9A-HJ-NP-Za-km-z]+$/;
export const base64alphabetRegex = /^[0-9A-Za-z/=\+]+$/;

export function bitsToBase64(bits: boolean[]) {

	if (!bits || bits.length === 0) {
		return '';
	}

	// 1️⃣ calcola quanti byte servono
	const byteLength = Math.ceil(bits.length / 8);
	const bytes = new Uint8Array(byteLength);

	// 2️⃣ riempi i byte (MSB → LSB, come nel tuo progetto)
	for (let i = 0; i < bits.length; i++) {
		if (bits[i]) {
			bytes[i >> 3] |= 1 << (7 - (i & 7));
		}
	}

	// 3️⃣ Uint8Array → Base64 standard
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return btoa(binary);

}


export function base64ToBits(
	base64: string,
	bitCount: number
): boolean[] {

	if (!base64 || bitCount <= 0) {
		return [];
	}

	// 1️⃣ Base64 → stringa binaria
	const binary = atob(base64.replace(/\s/g, ''));

	// 2️⃣ stringa binaria → Uint8Array
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	// 3️⃣ Uint8Array → bit array (MSB → LSB)
	const bits: boolean[] = new Array(bitCount);

	for (let i = 0; i < bitCount; i++) {
		const byteIndex = i >> 3;
		const bitIndex = 7 - (i & 7);
		bits[i] = ((bytes[byteIndex] >> bitIndex) & 1) === 1;
	}

	return bits;
}
