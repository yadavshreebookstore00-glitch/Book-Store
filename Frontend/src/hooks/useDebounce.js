import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms (default 300)
 * @returns {any} Debounced value
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: agar value change ho jaye delay ke andar
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;