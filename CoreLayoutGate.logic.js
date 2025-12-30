/**
 * CoreLayoutGate.logic.js (logic only)
 *
 * ✅ DO NOT PUT STYLES OR UI HERE
 * This file manages:
 * - resolving initial entry (home/onboarding/auth)
 * - route state
 * - complete() transitions back to home
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const CORE_ENTRY = {
  ONBOARDING: 'onboarding',
  HOME: 'home',
  AUTH: 'auth',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeEntry(value) {
  if (value === CORE_ENTRY.ONBOARDING) return CORE_ENTRY.ONBOARDING;
  if (value === CORE_ENTRY.AUTH) return CORE_ENTRY.AUTH;
  return CORE_ENTRY.HOME;
}

/**
 * @param {{
 *  resolveEntry: (() => (Promise<'onboarding'|'home'|'auth'>|'onboarding'|'home'|'auth')) | 'onboarding'|'home'|'auth',
 *  renderOnboarding?: unknown,
 *  renderAuth?: unknown
 * }} params
 */
export function useCoreLayoutGateLogic({ resolveEntry, renderOnboarding, renderAuth }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [entry, setEntry] = useState(CORE_ENTRY.HOME);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setStatus('loading');
        setError(null);

        const resolver = resolveEntry;
        const raw = typeof resolver === 'function' ? resolver() : resolver;
        const resolved = raw && typeof raw.then === 'function' ? await raw : raw;
        const nextEntry = normalizeEntry(resolved);

        if (cancelled || !mountedRef.current) return;
        setEntry(nextEntry);
        setStatus('ready');
      } catch (e) {
        if (cancelled || !mountedRef.current) return;
        setError(e instanceof Error ? e : new Error(String(e ?? 'Unknown error')));
        setStatus('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [resolveEntry]);

  const validateEntryRequirements = useCallback(
    (currentEntry) => {
      if (currentEntry === CORE_ENTRY.ONBOARDING) {
        assert(
          typeof renderOnboarding === 'function',
          '[expo-core-layout-module] resolveEntry returned "onboarding" but `renderOnboarding` was not provided.'
        );
      }
      if (currentEntry === CORE_ENTRY.AUTH) {
        assert(
          typeof renderAuth === 'function',
          '[expo-core-layout-module] resolveEntry returned "auth" but `renderAuth` was not provided.'
        );
      }
    },
    [renderOnboarding, renderAuth]
  );

  useEffect(() => {
    if (status !== 'ready') return;
    validateEntryRequirements(entry);
  }, [entry, status, validateEntryRequirements]);

  const complete = useCallback(() => {
    setEntry(CORE_ENTRY.HOME);
  }, []);

  const goToAuth = useCallback(() => {
    validateEntryRequirements(CORE_ENTRY.AUTH);
    setEntry(CORE_ENTRY.AUTH);
  }, [validateEntryRequirements]);

  const goToOnboarding = useCallback(() => {
    validateEntryRequirements(CORE_ENTRY.ONBOARDING);
    setEntry(CORE_ENTRY.ONBOARDING);
  }, [validateEntryRequirements]);

  const goHome = useCallback(() => {
    setEntry(CORE_ENTRY.HOME);
  }, []);

  return {
    status,
    entry,
    error,
    complete,
    goToAuth,
    goToOnboarding,
    goHome,
  };
}


