import { distance } from 'fastest-levenshtein';

/**
 * 住所の正規化
 */
export const normalizeAddress = (address: string): string => {
  return address
    .replace(/丁目/g, '-')    // "3丁目" → "3-"
    .replace(/(\d+)(?:番地|番)(\d+)号?/g, '$1-$2') // "14番地9号" → "14-9"
    .replace(/(\d+)(?:番地|番)(\d+)/g, '$1-$2') // "14番地9" → "14-9"
    .replace(/(\d+)(?:番地|番)(?![\d])/g, '$1-') // 番地や番で終わる場合
    .replace(/(\d+)号(?!室|部屋)/g, '$1')  // 号で終わる場合（部屋番号でない場合）
    .replace(/\s+/g, '')      // 空白削除
    .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角数字 → 半角
    .replace(/-\d+(?:号室|室|部屋).*$/, '') // 部屋番号を削除
    .replace(/(?<=-\d+)-+/g, '-') // 連続するハイフンを1つに
    .replace(/-+$/g, ''); // 末尾のハイフンを削除
}

/**
 * 住所のマッチスコアを計算
 */
export const calcMatchScore = (input: string, known: string): number => {
  const normalizedInput = normalizeAddress(input);
  const normalizedKnown = normalizeAddress(known);
  
  if (normalizedInput === normalizedKnown) {
    return 100;
  }
  
  const dist = distance(normalizedInput, normalizedKnown);
  const maxLength = Math.max(normalizedInput.length, normalizedKnown.length);
  return Math.max(0, Math.min(99, 100 - (dist * 100 / maxLength)));
}

/**
 * 最適なマッチを見つける
 */
export const findBestMatch = (
  searchTerm: string,
  address: string,
  apartmentName: string
): number => {
  const normalizedSearchTerm = normalizeAddress(searchTerm);
  const normalizedAddress = normalizeAddress(address);
  const normalizedApartment = normalizeAddress(apartmentName);
  
  // 住所のみの場合のスコア
  const addressMatchScore = calcMatchScore(normalizedSearchTerm, normalizedAddress);
  
  // 住所+マンション名の場合のスコア
  const fullAddressMatchScore = calcMatchScore(
    normalizedSearchTerm, 
    `${normalizedAddress}${normalizedApartment}`
  );

  // より高いスコアを採用
  return Math.max(addressMatchScore, fullAddressMatchScore);
}