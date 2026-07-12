// =============================================================================
// AssetFlow — Asset Tag Auto-Generation Utility
// File: backend/src/utils/assetTagGenerator.js
//
// Canonical constants from SHARED_ENUMS.md:
//   ASSET_TAG_PREFIX : "AF-"
//   ASSET_TAG_FORMAT : "AF-XXXX"  (4-digit, zero-padded)
//
// Database field: Asset.assetTag  (@unique, mapped to "asset_tag")
//   See DATABASE_SCHEMA.md → model Asset
//
// Usage (in asset controller):
//   const { generateAssetTag } = require('../utils/assetTagGenerator');
//   const tag = await generateAssetTag(prisma);
// =============================================================================

// ─── Constants (mirrored from SHARED_ENUMS.md "Common Validation Constants") ──

/** Prefix for every auto-generated asset tag. SHARED_ENUMS.md: ASSET_TAG_PREFIX */
const ASSET_TAG_PREFIX = 'AF-';

/**
 * Total width of the numeric suffix portion of ASSET_TAG_FORMAT ("AF-XXXX").
 * Four Xs → four digits → zero-padded to width 4.
 * SHARED_ENUMS.md: ASSET_TAG_FORMAT
 */
const ASSET_TAG_NUMBER_WIDTH = 4;

/** Human-readable display of the expected format (used in error messages only). */
const ASSET_TAG_FORMAT_DISPLAY = 'AF-XXXX';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a numeric sequence into the canonical ASSET_TAG_FORMAT string.
 *
 * @param {number} num  - Positive integer to format.
 * @returns {string}    - e.g. formatTag(1) → "AF-0001"
 *                             formatTag(42) → "AF-0042"
 *
 * Examples (inline per requirement):
 *   Empty table  → next num = 1  → "AF-0001"
 *   Max is AF-0042 → next num = 43 → "AF-0043"
 */
function formatTag(num) {
  // String.padStart enforces the zero-padding defined by ASSET_TAG_FORMAT.
  return `${ASSET_TAG_PREFIX}${String(num).padStart(ASSET_TAG_NUMBER_WIDTH, '0')}`;
}

/**
 * Resolve the next numeric suffix by inspecting the current highest assetTag.
 *
 * Approach: ORDER BY assetTag DESC LIMIT 1, then parse the suffix.
 * We do NOT use COUNT(*) because records may be deleted, leaving gaps that
 * would cause COUNT-based generation to produce duplicate tags.
 * Example: deleting AF-0003 leaves COUNT = 2 → next = AF-0003, which may
 * still be referenced in audit history — we avoid this by always reading MAX.
 *
 * @param {import('@prisma/client').PrismaClient} prismaClient
 * @returns {Promise<number>}  The next sequence number to use (1-indexed).
 */
async function resolveNextNumber(prismaClient) {
  // Fetch the lexicographically greatest assetTag.
  // Because ASSET_TAG_FORMAT is fixed-width ("AF-XXXX"), lexicographic order
  // matches numeric order — "AF-0042" > "AF-0009".
  const latestAsset = await prismaClient.asset.findFirst({
    orderBy: { assetTag: 'desc' },
    select: { assetTag: true },
  });

  if (!latestAsset) {
    // Empty table → first tag will be AF-0001
    // Example output: "AF-0001"
    return 1;
  }

  // Parse the numeric suffix after ASSET_TAG_PREFIX ("AF-").
  // e.g. "AF-0042" → suffix = "0042" → parsed = 42 → next = 43
  // Example output: "AF-0043"
  const suffix = latestAsset.assetTag.slice(ASSET_TAG_PREFIX.length);
  const parsed = parseInt(suffix, 10);

  if (isNaN(parsed)) {
    // Defensive guard: a tag exists but its numeric portion is malformed.
    throw new Error(
      `[assetTagGenerator] Cannot parse numeric suffix from existing tag: ` +
        `"${latestAsset.assetTag}". Expected format: ${ASSET_TAG_FORMAT_DISPLAY}`
    );
  }

  return parsed + 1;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate the next unique asset tag following ASSET_TAG_FORMAT ("AF-XXXX").
 *
 * Strategy:
 *   1. Query the highest existing Asset.assetTag ordered DESC (not COUNT*).
 *   2. Parse its numeric suffix and increment by 1.
 *   3. Format the candidate tag with ASSET_TAG_PREFIX + 4-digit zero-padding.
 *   4. Return the tag string — the caller (asset controller) writes it to the
 *      database where the @unique constraint on Asset.assetTag acts as the
 *      authoritative guard against duplicates.
 *
 * Race-condition handling (single monolithic Express backend — TECH_STACK_FREEZE.md):
 *   If two concurrent requests land here simultaneously and both derive the
 *   same next number, the second Prisma write will throw a unique-constraint
 *   violation (Prisma error code P2002). We catch that specific error and
 *   retry generation exactly once. If the retry also collides, we surface a
 *   clear error — distributed locking is intentionally out of scope per
 *   TECH_STACK_FREEZE.md (single-monolith, no Redis/advisory locks needed).
 *
 * @param {import('@prisma/client').PrismaClient} prismaClient  - Injected Prisma instance.
 * @returns {Promise<string>}  Next asset tag string, e.g. "AF-0001" or "AF-0043".
 * @throws {Error}  If generation fails twice (back-to-back collision or DB error).
 *
 * Examples:
 *   // Empty table            → resolves "AF-0001"
 *   // Current max = AF-0042  → resolves "AF-0043"
 */
async function generateAssetTag(prismaClient) {
  // ── Attempt 1 ──────────────────────────────────────────────────────────────
  try {
    const nextNumber = await resolveNextNumber(prismaClient);
    const candidateTag = formatTag(nextNumber);
    // Return candidate; the @unique constraint on Asset.assetTag in
    // schema.prisma enforces final uniqueness at write time.
    return candidateTag;
  } catch (error) {
    // Only retry on a Prisma unique-constraint violation (error code P2002).
    // All other errors (DB connectivity, parse failure, etc.) are re-thrown
    // immediately so the controller can handle them appropriately.
    if (error.code !== 'P2002') {
      throw error;
    }

    // ── Attempt 2 (single retry after race-condition collision) ─────────────
    // A concurrent request wrote the same tag between our read and the
    // caller's write. Re-query the current maximum and try exactly once more.
    try {
      const retryNumber = await resolveNextNumber(prismaClient);
      const retryTag = formatTag(retryNumber);
      return retryTag;
    } catch (retryError) {
      // Second collision or another error — surface clearly without looping.
      throw new Error(
        `[assetTagGenerator] Failed to generate a unique asset tag after 2 attempts. ` +
          `Last error: ${retryError.message || retryError.code || String(retryError)}`
      );
    }
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { generateAssetTag };
