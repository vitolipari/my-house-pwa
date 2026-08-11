import {getLastElementOr} from './array-util';
import {EMOJ} from './emoj';


/**
 * Controlla che sia un numero oppure no
 * @param toCheck
 * @returns {boolean}
 */
export const isNumber = (toCheck: any) => {
    if( !toCheck ) return false;
    return (
        !!(
            (new String( toCheck )).toString().trim()       // conversione in stringa non vuota
        ) &&
        !isNaN( toCheck )   // è un numero
    );
};


export const isString = (toCheck: string) => {
    if( !!!toCheck ) return false;
    return typeof toCheck === "string";
};



/**
 * <em>Non finito ancora</em>
 * decodifica da un url-encoded
 * @param str
 * @returns {string|*}
 */
export const urlDecode = (str: string) => {
    if( isNumber( str ) ) return str.toString();
    if( !str ) return "";
    if( typeof str !== "string" ) return str;
    return (
        str
            .split("%0a").join("").split("%0A").join("")
            .split("%09").join("")
            .split("%20").join(" ")
            .split("%21").join("!")
            .split("%22").join(":")
            .split("%23").join("#")
            .split("%24").join("$")
            .split("%25").join("#")
            .split("%26").join("&")
            .split("%27").join("'")
            .split("%28").join("(")
            .split("%29").join(")")
            .split("%2a").join("*").split("%2A").join("*")
            .split("%2b").join("+").split("%2B").join("+")
            .split("%2c").join(",").split("%2C").join(",")
            .split("%2d").join("-").split("%2D").join("-")
            .split("%2e").join(".").split("%2E").join(".")
            .split("%2f").join("/").split("%2F").join("/")
            .split("%3a").join(":").split("%3A").join(":")
            .split("%3b").join(";").split("%3B").join(";")
            .split("%3c").join("<").split("%3C").join("<")
            .split("%3d").join("=").split("%3D").join("=")
            .split("%3e").join(">").split("%3E").join(">")
            .split("%3f").join("?").split("%3F").join("?")
            .split("%40").join("@")
            .split("%5b").join("[").split("%5B").join("[")
            .split("%5c").join("\\").split("%5C").join("\\")
            .split("%5d").join("]").split("%5D").join("]")
            .split("%5e").join("^").split("%5E").join("^")
            .split("%5f").join("_").split("%5F").join("_")
            .split("%60").join("`")
            .split("%7b").join("{").split("%7B").join("{")
            .split("%7c").join("|").split("%7C").join("|")
            .split("%7d").join("}").split("%7D").join("}")
            .split("%7e").join("~").split("%7E").join("~")
            .split("%80").join("€")
    );
};





export const decodeUriEncodedString = (str: string) => (
    str
        .split("%0a").join("").split("%0A").join("")
        .split("%09").join("")
        .split("%20").join(" ")
        .split("%21").join("!")
        .split("%22").join(":")
        .split("%23").join("#")
        .split("%24").join("$")
        .split("%25").join("#")
        .split("%26").join("&")
        .split("%27").join("'")
        .split("%28").join("(")
        .split("%29").join(")")
        .split("%2a").join("*").split("%2A").join("*")
        .split("%2b").join("+").split("%2B").join("+")
        .split("%2c").join(",").split("%2C").join(",")
        .split("%2d").join("-").split("%2D").join("-")
        .split("%2e").join(".").split("%2E").join(".")
        .split("%2f").join("/").split("%2F").join("/")
        .split("%3a").join(":").split("%3A").join(":")
        .split("%3b").join(";").split("%3B").join(";")
        .split("%3c").join("<").split("%3C").join("<")
        .split("%3d").join("=").split("%3D").join("=")
        .split("%3e").join(">").split("%3E").join(">")
        .split("%3f").join("?").split("%3F").join("?")
        .split("%40").join("@")
        .split("%5b").join("[").split("%5B").join("[")
        .split("%5c").join("\\").split("%5C").join("\\")
        .split("%5d").join("]").split("%5D").join("]")
        .split("%5e").join("^").split("%5E").join("^")
        .split("%5f").join("_").split("%5F").join("_")
        .split("%60").join("`")
        .split("%7b").join("{").split("%7B").join("{")
        .split("%7c").join("|").split("%7C").join("|")
        .split("%7d").join("}").split("%7D").join("}")
        .split("%7e").join("~").split("%7E").join("~")
        .split("%80").join("€")
);






/**
 * Tronca il nome del file, lasciando l'estensione
 *
 * ATTENZIONE ai file senza estensione ma con un punto nel nome
 *
 * @param fileName
 * @returns {string}
 */
export const truncateFileName = (fileName: string, MAX_FILE_NAME_LENGTH: number) => {
    if(!fileName) return "";
    if(typeof fileName === "undefined") return "";
    let name = (new String(fileName)).toString();
    return (
        [
            name
                .split(".")
                .reverse()
                .filter( (name, index) => index > 0)
                .reverse()
                .join(".")
                .substr(0, MAX_FILE_NAME_LENGTH)
            ,
            name
                .split(".")
                .reduce( getLastElementOr, "")
        ]
            .join(".")
    );
}



export const emoj = (emo: string) => {
    if(!emo) return "";

    const encodedEmoji = Object.prototype.hasOwnProperty.call(EMOJ, emo)
        ? EMOJ[emo as keyof typeof EMOJ]
        : emo;
    const codePoints = encodedEmoji
        .split(",")
        .map(codePoint => Number(codePoint.trim()));

    if (
        codePoints.some(codePoint => (
            !Number.isInteger(codePoint) ||
            codePoint < 0 ||
            codePoint > 0x10FFFF
        ))
    ) {
        return "";
    }

    return String.fromCodePoint(...codePoints);
};
