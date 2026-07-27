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
      <div className="glass-card p-4 sm:p-6 animate-scale-in hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="p-2 sm:p-3 bg-gradient-primary rounded-xl sm:rounded-2xl shadow-glow flex-shrink-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground animate-float" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-card-foreground text-sm sm:text-lg truncate">{selectedFile.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
              </p>
            </div>
          </div>
          {!isProcessing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFile}
              className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-110 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="glass-card border-dashed border-2 hover:border-primary/70 transition-all duration-500 hover:shadow-glow">
        <div
          {...getRootProps()}
          className={`p-6 sm:p-8 lg:p-10 text-center cursor-pointer transition-all duration-500 ${
            isDragActive 
              ? 'bg-primary/10 border-primary scale-105 shadow-glow' 
              : 'hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-primary/20 backdrop-blur-sm">
                <Upload className={`w-8 h-8 sm:w-12 sm:h-12 text-primary ${
                  isDragActive ? 'animate-bounce' : 'animate-float'
                }`} />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-primary/30 animate-pulse" />
              )}
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-card-foreground">
                {isDragActive 
                  ? 'Solte o arquivo aqui' 
                  : 'Selecione a Matrícula'
                }
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                {isDragActive 
                  ? 'Iniciando processamento profissional...' 
                  : 'Arraste o arquivo PDF ou clique para selecionar'
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Apenas arquivos PDF são aceitos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simplified background animation for better performance */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-ping" />
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};