const UPLOADCARE_UPLOAD_URL = "https://upload.uploadcare.com/base/";
const UPLOADCARE_API_URL = "https://api.uploadcare.com";

function getKeys() {
  const publicKey =
    process.env.UPLOADCARE_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
  const secretKey = process.env.UPLOADCARE_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error("Uploadcare is not configured.");
  }

  return { publicKey, secretKey };
}

function getCdnBase() {
  const base = process.env.UPLOADCARE_CDN_BASE;
  if (!base) {
    throw new Error(
      "UPLOADCARE_CDN_BASE is not set. Find your personal delivery subdomain in " +
        "Uploadcare Dashboard → Project Settings → Delivery, and add it to .env."
    );
  }
  return base;
}

/**
 * Uploads a File (from a Server Action's FormData) to Uploadcare and
 * returns its public CDN URL. Throws on failure so callers can surface an
 * error to the form instead of silently saving a broken image reference.
 */
export async function uploadMenuImage(file: File, folder: "dishes" | "specials"): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB.");
  }

  const { publicKey } = getKeys();
  const cdnBase = getCdnBase();

  const body = new FormData();
  body.append("UPLOADCARE_PUB_KEY", publicKey);
  body.append("UPLOADCARE_STORE", "1"); // permanently store, not just a 24h temp file
  body.append("metadata[folder]", folder); // just informational tagging, not a real folder
  body.append("file", file);

  const res = await fetch(UPLOADCARE_UPLOAD_URL, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Image upload failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { file: string };
  const uuid = data.file;

  if (!uuid) {
    throw new Error("Image upload failed: no file id returned.");
  }

  // Accounts created after Sept 4, 2025 must use their personal
  // *.ucarecd.net subdomain — the legacy ucarecdn.com domain 404s for them.
  return `https://${cdnBase}/${uuid}/`;
}

function extractUuid(publicUrl: string): string | null {
  const match = publicUrl.match(/\.ucarecd(?:n)?\.(?:net|com)\/([a-f0-9-]{36})\//i);
  return match ? match[1] : null;
}

/**
 * Deletes a file from Uploadcare given its public CDN URL. Safe to call with
 * a null/undefined url, or a url that isn't a valid Uploadcare CDN link —
 * failures here are logged, not thrown, since a failed cleanup shouldn't
 * block the actual delete/update operation the caller is doing.
 */
export async function deleteMenuImage(publicUrl: string | null | undefined) {
  if (!publicUrl) return;

  const uuid = extractUuid(publicUrl);
  if (!uuid) return;

  try {
    const { publicKey, secretKey } = getKeys();
    const res = await fetch(`${UPLOADCARE_API_URL}/files/${uuid}/storage/`, {
      method: "DELETE",
      headers: {
        Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
        Accept: "application/vnd.uploadcare-v0.7+json",
      },
    });

    if (!res.ok && res.status !== 404) {
      const text = await res.text().catch(() => "");
      console.error(`Failed to delete Uploadcare file ${uuid}: ${res.status} ${text}`);
    }
  } catch (error) {
    console.error("Failed to delete menu image:", error instanceof Error ? error.message : String(error));
  }
}