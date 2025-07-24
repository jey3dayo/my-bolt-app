import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { WebClient } from "@slack/web-api";

// Type definitions
export interface FileUploadOptions {
  channel: string;
  title: string;
  altText?: string;
  comment?: string;
  filename?: string;
}

export interface TempFileInfo {
  path: string;
  cleanup: () => void;
}

export interface UploadResult {
  id: string;
  permalink: string;
  url_private: string;
}

// Download file from URL
export async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Create temporary file with cleanup capability
export function createTempFile(filename: string, data: Buffer, extension: string = ".png"): TempFileInfo {
  const tempDir = os.tmpdir();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9]/g, "_");
  const tempFilePath = path.join(tempDir, `${sanitizedFilename}${extension}`);

  fs.writeFileSync(tempFilePath, data);

  return {
    path: tempFilePath,
    cleanup: () => {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file: ${tempFilePath}`, error);
      }
    },
  };
}

// Upload file to Slack
export async function uploadFileToSlack(
  client: WebClient,
  filePath: string,
  options: FileUploadOptions,
): Promise<UploadResult> {
  const result = await client.files.uploadV2({
    channel_id: options.channel,
    title: options.title,
    alt_text: options.altText || options.title,
    initial_comment: options.comment,
    file: fs.createReadStream(filePath),
    filename: options.filename || path.basename(filePath),
  });

  return result.files?.[0] as UploadResult;
}

// Validate file extension
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

// Get file extension from URL
export function getFileExtensionFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return path.extname(pathname).toLowerCase() || ".png";
  } catch {
    return ".png";
  }
}

// Download and upload image in one operation
export async function downloadAndUploadImage(
  client: WebClient,
  imageUrl: string,
  options: FileUploadOptions,
): Promise<UploadResult> {
  let tempFile: TempFileInfo | null = null;

  try {
    // Download file
    const buffer = await downloadFile(imageUrl);

    // Determine file extension
    const extension = getFileExtensionFromUrl(imageUrl);

    // Create temporary file
    tempFile = createTempFile(options.title, buffer, extension);

    // Upload to Slack
    const result = await uploadFileToSlack(client, tempFile.path, {
      ...options,
      filename: options.filename || `${options.title}${extension}`,
    });

    return result;
  } finally {
    // Cleanup
    tempFile?.cleanup();
  }
}

// Download and upload multiple images
export async function downloadAndUploadMultipleImages(
  client: WebClient,
  imageUrls: string[],
  baseOptions: Omit<FileUploadOptions, "title">,
): Promise<UploadResult[]> {
  return Promise.all(
    imageUrls.map((imageUrl, index) =>
      downloadAndUploadImage(client, imageUrl, {
        ...baseOptions,
        title: `${baseOptions.channel}_image_${index + 1}`,
      }),
    ),
  );
}

// Legacy function for backward compatibility
export async function downloadAndSaveTemp(
  imageUrl: string,
  filename: string,
): Promise<{ path: string; cleanup: () => void }> {
  const buffer = await downloadFile(imageUrl);
  const extension = getFileExtensionFromUrl(imageUrl);
  return createTempFile(filename, buffer, extension);
}
