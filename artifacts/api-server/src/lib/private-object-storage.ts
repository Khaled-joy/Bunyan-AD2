import { Storage, type File } from "@google-cloud/storage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function privateDir() {
  const value = process.env.PRIVATE_OBJECT_DIR;
  if (!value) throw new Error("PRIVATE_OBJECT_DIR must be configured.");
  return value.replace(/\/+$/, "");
}
function parseObjectPath(value: string) {
  const normalized = value.startsWith("/") ? value : `/${value}`;
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("Invalid private object path.");
  return { bucketName: parts[0], objectName: parts.slice(1).join("/") };
}
function sampleFile(storedPath: string): File {
  if (!/^\/objects\/game-requests\/[a-f0-9-]+\.(pdf|png|jpe?g|pptx|mp4)$/i.test(storedPath)) {
    throw new Error("Invalid sample object path.");
  }
  const relative = storedPath.slice("/objects/".length);
  const { bucketName, objectName } = parseObjectPath(`${privateDir()}/${relative}`);
  return storage.bucket(bucketName).file(objectName);
}

export async function uploadPrivateSample(storedPath: string, bytes: Buffer, contentType: string) {
  const file = sampleFile(storedPath);
  await file.save(bytes, {
    resumable: false,
    validation: "crc32c",
    metadata: {
      contentType,
      cacheControl: "private, no-store",
      metadata: { purpose: "game-request-sample" },
    },
  });
}

export function getPrivateSample(storedPath: string) {
  return sampleFile(storedPath);
}

export async function deletePrivateSample(storedPath?: string | null) {
  if (!storedPath) return;
  await sampleFile(storedPath).delete({ ignoreNotFound: true });
}