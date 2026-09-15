import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = 'Type and press Enter...',
  error,
  helperText,
  className = '',
  id,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      onChange(updated);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    onChange(updated);
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Input row with Add button */}
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 px-3.5 py-2.5 bg-white dark:bg-slate-950 ${
            error
              ? 'border-rose-400 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-950 hover:border-slate-400 dark:hover:border-slate-650'
          }`}
        />
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleAddTag}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Rendered Tag Badges */}
      <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
        {tags.map((tag) => (
          <Badge key={tag} variant="primary" size="md" className="flex items-center gap-1.5 py-1 px-3">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-purple-400 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-100 transition-colors p-0.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic py-1">No tags added yet.</span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default TagInput;
