// Phone numbers as people type them -> the digits wa.me needs.
//
// wa.me wants the country code and no "+" or separators. Argentine mobiles
// use 54 + 9 + area code + number (no 0, no 15). Numbers without a country
// code are assumed to be Argentine, the market this product is sold in.

// Old Argentine format: area code + "15" + number, 10 digits once the "15"
// is gone. The area code has 2 to 4 digits, so the "15" can be in 3 places.
function dropLegacyMobilePrefix(national: string) {
  if (national.length !== 12) return national;
  for (const at of [2, 3, 4]) {
    if (national.slice(at, at + 2) === "15") {
      return national.slice(0, at) + national.slice(at + 2);
    }
  }
  return national;
}

// `national` is what follows the country code (or the whole number when it
// had none). Returns the 10 digits of area code + subscriber, or null.
function argentineNational(national: string): string | null {
  let n = national;
  if (n.startsWith("9")) n = n.slice(1); // mobile marker, added back later
  if (n.startsWith("0")) n = n.slice(1); // trunk prefix
  n = dropLegacyMobilePrefix(n);
  return n.length === 10 ? n : null;
}

// Digits for https://wa.me/<digits>, or null when the number is incomplete.
export function whatsappNumber(raw: string): string | null {
  const text = raw.trim();
  let digits = text.replace(/\D/g, "");
  let international = text.startsWith("+");

  if (!international && digits.startsWith("00")) {
    digits = digits.slice(2);
    international = true;
  }

  if (digits.startsWith("54") && (international || digits.length >= 12)) {
    const national = argentineNational(digits.slice(2));
    return national ? `549${national}` : null;
  }

  if (international) {
    // Another country: trust what was typed if it has a plausible length.
    return digits.length >= 8 && digits.length <= 15 ? digits : null;
  }

  const national = argentineNational(digits);
  return national ? `549${national}` : null;
}

// "+54 9 3515550101" for the dialog, so the nutritionist sees where it goes.
export function displayWhatsappNumber(digits: string) {
  return digits.startsWith("549") ? `+54 9 ${digits.slice(3)}` : `+${digits}`;
}
