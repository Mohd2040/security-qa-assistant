// lib/arabic-stemmer.ts
/**
 * Simple Arabic stemmer for better word matching
 * Removes common prefixes and suffixes to extract root forms
 */

// Common Arabic prefixes
const PREFIXES = [
    'ال',   // the (al-)
    'و',    // and (wa-)
    'ف',    // so/then (fa-)
    'ب',    // with/by (bi-)
    'ك',    // like (ka-)
    'ل',    // for (li-)
    'لل',   // for the (lil-)
    'بال',  // with the (bil-)
    'كال',  // like the (kal-)
    'فال',  // so the (fal-)
    'وال',  // and the (wal-)
];

// Common Arabic suffixes
const SUFFIXES = [
    'ية',   // -ness/-ity
    'يه',   // variant
    'ات',   // plural feminine
    'ون',   // plural masculine
    'ين',   // plural masculine (accusative/genitive)
    'ها',   // her/it
    'هم',   // them (masculine)
    'هن',   // them (feminine)
    'كم',   // you (plural)
    'نا',   // us/our
    'ني',   // me
    'ك',    // you/your
    'ه',    // him/his/it
    'ي',    // my
    'ة',    // feminine marker
    'ت',    // you/feminine past
];

/**
 * Remove Arabic prefixes from word
 */
function removePrefix(word: string): string {
    for (const prefix of PREFIXES) {
        if (word.startsWith(prefix) && word.length > prefix.length + 2) {
            return word.substring(prefix.length);
        }
    }
    return word;
}

/**
 * Remove Arabic suffixes from word
 */
function removeSuffix(word: string): string {
    for (const suffix of SUFFIXES) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
            return word.substring(0, word.length - suffix.length);
        }
    }
    return word;
}

/**
 * Extract Arabic word stem (root)
 * This is a simplified stemmer - for production, consider using a dedicated library
 */
export function stemArabicWord(word: string): string {
    if (!word || word.length < 3) return word;

    let stem = word;

    // Remove prefix
    stem = removePrefix(stem);

    // Remove suffix
    stem = removeSuffix(stem);

    // If the word is too short after stemming, return original
    if (stem.length < 3) return word;

    return stem;
}

/**
 * Stem all words in Arabic text
 */
export function stemArabicText(text: string): string {
    if (!text) return '';

    return text
        .split(/\s+/)
        .map(word => stemArabicWord(word))
        .join(' ');
}

/**
 * Check if stemming would be beneficial for this word
 * (i.e., word contains common affixes)
 */
export function shouldStem(word: string): boolean {
    if (!word || word.length < 4) return false;

    // Check for prefixes
    for (const prefix of PREFIXES) {
        if (word.startsWith(prefix)) return true;
    }

    // Check for suffixes
    for (const suffix of SUFFIXES) {
        if (word.endsWith(suffix)) return true;
    }

    return false;
}
