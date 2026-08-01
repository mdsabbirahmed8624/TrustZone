'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Upload, Search, ChevronDown } from 'lucide-react';

interface BaseInputProps {
  label: string;
  name: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

// 1. Text Input
export const InputText: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps
> = ({ label, name, error, helperText, required, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={name} className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        className={`w-full px-3.5 py-2 text-sm bg-card border ${
          error ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
        } rounded-lg text-foreground transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-4 ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="text-[10px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// 2. Email Input
export const InputEmail: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps
> = (props) => {
  return <InputText type="email" {...props} />;
};

// 3. Phone Input
export const InputPhone: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps
> = (props) => {
  return <InputText type="tel" placeholder="+880 1XXXX-XXXXXX" {...props} />;
};

// 4. Password Input (with show/hide eye toggle)
export const InputPassword: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps
> = ({ label, name, error, helperText, required, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={name} className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-3.5 pr-10 py-2 text-sm bg-card border ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
          } rounded-lg text-foreground transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-4 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground focus:outline-none"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      {error && (
        <p id={`${name}-error`} className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="text-[10px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// 5. Select Control
export const InputSelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & BaseInputProps & {
    options: Array<{ value: string; label: string }>;
  }
> = ({ label, name, error, helperText, required, options, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={name} className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          className={`w-full appearance-none px-3.5 pr-10 py-2 text-sm bg-card border ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
          } rounded-lg text-foreground transition-all focus:outline-none focus:ring-4 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      {error && (
        <p id={`${name}-error`} className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="text-[10px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// 6. Date Picker
export const InputDate: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps
> = (props) => {
  return (
    <div className="relative">
      <InputText type="date" {...props} />
    </div>
  );
};

// 7. Image Upload
export const InputImageUpload: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps & {
    previewUrl?: string;
    onImageChange?: (file: File) => void;
  }
> = ({ label, name, error, helperText, required, previewUrl, onImageChange, className = '', ...props }) => {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (onImageChange) onImageChange(file);
    }
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      <label htmlFor={name} className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4 p-4 bg-muted/40 border border-border border-dashed rounded-lg">
        <div className="h-14 w-14 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground/60" />
          )}
        </div>
        <div className="space-y-1">
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            {...props}
          />
          <label
            htmlFor={name}
            className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 inline-block"
          >
            Choose Image
          </label>
          <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
        </div>
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[10px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// 8. Search Select control (Combobox/Autocomplete search)
export const InputSearchSelect: React.FC<
  BaseInputProps & {
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  }
> = ({ label, name, error, helperText, required, options, value, onChange, placeholder = 'Search options...' }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-1.5 w-full relative">
      <label htmlFor={name} className="block text-xs font-bold text-foreground/80 tracking-wide uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          id={name}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left px-3.5 py-2 text-sm bg-card border ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
          } rounded-lg text-foreground transition-all flex items-center justify-between focus:outline-none focus:ring-4`}
        >
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground/60'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col">
            <div className="relative border-b border-border p-2 bg-muted/20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter..."
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-card border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <ul className="overflow-y-auto flex-grow py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-secondary/80 transition-colors ${
                        opt.value === value ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3.5 py-2 text-xs text-muted-foreground text-center">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[10px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
