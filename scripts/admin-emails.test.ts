import assert from "node:assert/strict";
import { adminEmails, isAdminEmail } from "../src/lib/admin-emails.ts";

// Not set, empty or only commas: nobody is an admin
delete process.env.ADMIN_EMAILS;
assert.deepEqual(adminEmails(), []);
assert.equal(isAdminEmail("facu@example.com"), false);
process.env.ADMIN_EMAILS = " , ,";
assert.deepEqual(adminEmails(), []);
assert.equal(isAdminEmail(""), false);
assert.equal(isAdminEmail(undefined), false);

// Several emails: spaces and case do not matter, on either side
process.env.ADMIN_EMAILS = "Facu@Example.com, bruno@example.com ,";
assert.deepEqual(adminEmails(), ["facu@example.com", "bruno@example.com"]);
assert.equal(isAdminEmail("facu@example.com"), true);
assert.equal(isAdminEmail("  BRUNO@example.COM "), true);

// Only exact matches: no substrings, no other domains
assert.equal(isAdminEmail("facu@example.com.ar"), false);
assert.equal(isAdminEmail("xfacu@example.com"), false);
assert.equal(isAdminEmail("other@example.com"), false);
assert.equal(isAdminEmail(null), false);

console.log("admin-emails: all tests passed");
