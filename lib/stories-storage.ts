import { createClient } from "@supabase/supabase-js";

const STORAGE_REF_PREFIX = "storage://";

function getStorageEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Stories storage environment variables are not configured.");
  }

  return { supabaseUrl, serviceRoleKey };
}

function getStorageClient() {
  const { supabaseUrl, serviceRoleKey } = getStorageEnv();
  return createClient(supabaseUrl, serviceRoleKey);
}

function parseLegacyPublicStorageUrl(value: string) {
  const { supabaseUrl } = getStorageEnv();
  const normalizedBase = supabaseUrl.replace(/\/$/, "");
  const prefix = `${normalizedBase}/storage/v1/object/public/`;
  if (!value.startsWith(prefix)) {
    return null;
  }

  const raw = value.slice(prefix.length);
  const slashIndex = raw.indexOf("/");
  if (slashIndex <= 0 || slashIndex === raw.length - 1) {
    return null;
  }

  return {
    bucket: raw.slice(0, slashIndex),
    path: raw.slice(slashIndex + 1),
  };
}

export function makeStoryStorageRef(bucket: string, path: string) {
  return `${STORAGE_REF_PREFIX}${bucket}/${path}`;
}

export function parseStoryStorageRef(value: string | null | undefined) {
  if (!value || !value.startsWith(STORAGE_REF_PREFIX)) {
    return null;
  }

  const raw = value.slice(STORAGE_REF_PREFIX.length);
  const slashIndex = raw.indexOf("/");
  if (slashIndex <= 0 || slashIndex === raw.length - 1) {
    return null;
  }

  return {
    bucket: raw.slice(0, slashIndex),
    path: raw.slice(slashIndex + 1),
  };
}

export function isStoryStorageRef(value: string | null | undefined) {
  return Boolean(parseStoryStorageRef(value));
}

export async function signStoryStorageRef(storageRef: string, expiresInSeconds = 60 * 60) {
  const parsed = parseStoryStorageRef(storageRef);
  if (!parsed) {
    return null;
  }

  const client = getStorageClient();
  const { data, error } = await client.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresInSeconds);
  if (error) {
    throw new Error(error.message);
  }

  return data?.signedUrl ?? null;
}

export async function resolveStoryMediaUrl(value: string | null | undefined, expiresInSeconds = 60 * 60) {
  if (!value) {
    return null;
  }

  const parsed = parseStoryStorageRef(value) ?? parseLegacyPublicStorageUrl(value);
  if (!parsed) {
    return value;
  }

  const client = getStorageClient();
  const { data, error } = await client.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresInSeconds);
  if (error) {
    throw new Error(error.message);
  }

  return data?.signedUrl ?? null;
}

export async function ensurePrivateStoriesBucket(
  bucket: string,
  options: {
    fileSizeLimit: string;
    allowedMimeTypes: string[];
  }
) {
  const client = getStorageClient();
  const { data: buckets, error: listError } = await client.storage.listBuckets();
  if (listError) {
    throw new Error(listError.message);
  }

  const existing = (buckets ?? []).find((entry) => entry.name === bucket);
  if (!existing) {
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    });
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(createError.message);
    }
    return;
  }

  if (existing.public) {
    const { error: updateError } = await client.storage.updateBucket(bucket, {
      public: false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    });
    if (updateError) {
      throw new Error(updateError.message);
    }
  }
}

export async function uploadStoryStorageObject(params: {
  bucket: string;
  path: string;
  file: File | Blob;
  contentType?: string | null;
  upsert?: boolean;
}) {
  const client = getStorageClient();
  const { error } = await client.storage.from(params.bucket).upload(params.path, params.file, {
    upsert: params.upsert ?? false,
    contentType: params.contentType ?? "application/octet-stream",
  });
  if (error) {
    throw new Error(error.message);
  }

  return makeStoryStorageRef(params.bucket, params.path);
}
