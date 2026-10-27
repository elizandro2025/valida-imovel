import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  isProcessing
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  if (selectedFile) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-soft transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Arquivo PDF da Matrícula
              </p>
            </div>
          </div>
          {!isProcessing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFile}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shrink-0 gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Remover</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/40 hover:bg-secondary/60'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Upload className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {isDragActive ? 'Solte a matrícula aqui' : 'Arraste a certidão em PDF'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Digital ou escaneada de qualquer cartório do Brasil, até 15 MB
            </p>
          </div>
          <Button variant="outline" size="sm" type="button" className="mt-1">
            Escolher arquivo
          </Button>
        </div>
      </div>
    </div>
  );
};