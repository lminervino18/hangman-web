const RAE_DICTIONARY_BASE_URL = 'https://dle.rae.es/'

/** Builds a direct lookup URL on the RAE's Diccionario de la lengua española. */
export function buildDictionaryUrl(word: string): string {
  return RAE_DICTIONARY_BASE_URL + encodeURIComponent(word.toLowerCase())
}
