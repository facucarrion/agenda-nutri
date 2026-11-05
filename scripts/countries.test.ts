import assert from "node:assert/strict";
import {
  countryByIso,
  countryFromHeader,
  countryFromLanguages,
  countryFromTimeZone,
} from "../src/lib/countries.ts";

// Header sent by the hosting platform
assert.equal(countryFromHeader("AR"), "AR");
assert.equal(countryFromHeader("uy"), "UY");
assert.equal(countryFromHeader("JP"), null); // not in the list
assert.equal(countryFromHeader(null), null);
assert.equal(countryFromHeader(undefined), null);

// Time zone says where the person is
assert.equal(countryFromTimeZone("America/Argentina/Cordoba"), "AR");
assert.equal(countryFromTimeZone("America/Argentina/Buenos_Aires"), "AR");
assert.equal(countryFromTimeZone("America/Montevideo"), "UY");
assert.equal(countryFromTimeZone("Europe/Madrid"), "ES");
assert.equal(countryFromTimeZone("Asia/Tokyo"), null);

// Browser language, region only
assert.equal(countryFromLanguages(["es-AR", "es"]), "AR");
assert.equal(countryFromLanguages(["es", "en-US"]), "US");
assert.equal(countryFromLanguages(["es", "en"]), null);

// Lookup falls back to Argentina
assert.equal(countryByIso("UY").dial, "598");
assert.equal(countryByIso("ZZ").iso, "AR");

console.log("countries: all tests passed");
