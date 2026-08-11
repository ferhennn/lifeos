import { useState } from "react";

/**
 * Detects whether `value` changed since the last render, without a useEffect.
 * Returns true on the render where the change is first observed, so callers
 * can react to it inline (e.g. resetting other state) per React's
 * "adjusting state when a prop changes" pattern.
 */
export function useValueChanged<T>(value: T): boolean {
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    return true;
  }
  return false;
}
