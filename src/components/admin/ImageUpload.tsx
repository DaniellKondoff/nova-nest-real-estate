"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return `${file.name}: Невалиден формат. Използвайте JPG, PNG или WebP.`;
    }

    if (file.size > maxSize) {
      return `${file.name}: Файлът е твърде голям. Максимум 5MB.`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles = Array.from(fileList);
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        setError(`Максимум ${maxImages} снимки`);
        return;
      }

      if (newFiles.length > remainingSlots) {
        setError(`Можете да добавите само още ${remainingSlots} снимки`);
        return;
      }

      // Validate all files
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setError(null);
      onImagesChange([...images, ...newFiles]);
    },
    [images, maxImages, onImagesChange]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Handle click to browse
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            isDragging
              ? "border-[#D4AF37] bg-[#D4AF37]/10"
              : "border-gray-300 hover:border-[#D4AF37]"
          }
        `}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-700 font-medium mb-1">
          Плъзнете снимки тук или кликнете за избор
        </p>
        <p className="text-sm text-gray-500">
          Максимум {maxImages} снимки, до 5MB всяка
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            const isPrimary = index === 0;

            return (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
              >
                {/* Image */}
                <div className="relative w-full h-[120px] bg-gray-100">
                  <Image
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                    onLoad={() => {
                      // Clean up the URL after image loads
                      URL.revokeObjectURL(previewUrl);
                    }}
                  />
                </div>

                {/* Primary Badge */}
                {isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#D4AF37] text-white text-xs font-medium px-2 py-1 rounded">
                    Главна
                  </div>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Изтрий"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* File Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                  {file.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Text */}
      {images.length > 0 && (
        <p className="text-sm text-gray-600">
          {images.length} от {maxImages} снимки. Първата снимка е главната.
        </p>
      )}
    </div>
  );
}

