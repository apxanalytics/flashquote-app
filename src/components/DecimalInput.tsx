import { useState, useEffect } from 'react';

interface DecimalInputProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  decimals?: number;
}

export default function DecimalInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0.00',
  className = '',
  min = 0,
  max,
  decimals = 2,
}: DecimalInputProps) {
  const [textValue, setTextValue] = useState(
    value > 0 ? value.toFixed(decimals) : ''
  );

  useEffect(() => {
    setTextValue(value > 0 ? value.toFixed(decimals) : '');
  }, [value, decimals]);

  const handleChange = (val: string) => {
    const regex = decimals > 0
      ? new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
      : /^\d*$/;

    if (val === '' || regex.test(val)) {
      setTextValue(val);
      const parsed = val === '' ? 0 : parseFloat(val) || 0;
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (textValue === '' || textValue === '0') {
      setTextValue('');
      onChange(0);
    } else {
      const parsed = parseFloat(textValue);
      if (!isNaN(parsed)) {
        let bounded = parsed;
        if (min !== undefined) bounded = Math.max(min, bounded);
        if (max !== undefined) bounded = Math.min(max, bounded);

        const formatted = bounded.toFixed(decimals);
        setTextValue(formatted);
        onChange(parseFloat(formatted));
      } else {
        setTextValue('');
        onChange(0);
      }
    }
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-16' : 'pr-4'} py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent ${className}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  );
}
