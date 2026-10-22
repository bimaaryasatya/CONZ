export interface ConvertResult {
  success: boolean;
  input_path: string;
  output_path: string;
  output_filename: string;
  message: string;
  size_bytes: number;
}

export interface FileMetadata {
  name: string;
  extension: string;
  dir: string;
  size_bytes: number;
}

export interface ConversionRecord {
  id: string;
  originalName: string;
  originalExt: string;
  targetFormat: string;
  inputPath: string;
  outputPath: string;
  outputFilename: string;
  timestamp: string;
  status: 'converting' | 'success' | 'failed';
  errorMessage?: string;
  sizeBytes?: number;
}

export interface FormatChamber {
  format: string;
  label: string;
  color: string;
  description: string;
}
