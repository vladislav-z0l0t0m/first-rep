export interface UploadResult {
  successful: { filename: string; url: string }[];
  failed: { filename: string; message: string }[];
}
