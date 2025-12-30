/**
 * CoreLayout.logic.js (logic only)
 *
 * ✅ DO NOT PUT STYLES OR UI HERE
 * This file manages:
 * - pages config validation
 * - active page state
 * - stable page-change handlers
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizePages(pages) {
  return Array.isArray(pages) ? pages : [];
}

function validatePagesV1({ pages, maxPages }) {
  const safePages = normalizePages(pages);
  const limit = typeof maxPages === 'number' && Number.isFinite(maxPages) ? maxPages : 5;

  assert(safePages.length >= 1, '[expo-core-layout-module] `pages` must have at least 1 page.');
  assert(
    safePages.length <= limit,
    `[expo-core-layout-module] \`pages\` must have at most ${limit} pages.`
  );

  const keys = new Set();
  safePages.forEach((p, idx) => {
    const at = `pages[${idx}]`;
    assert(p && typeof p === 'object', `[expo-core-layout-module] ${at} must be an object.`);
    assert(typeof p.key === 'string' && p.key.trim(), `[expo-core-layout-module] ${at}.key is required.`);
    assert(typeof p.title === 'string' && p.title.trim(), `[expo-core-layout-module] ${at}.title is required.`);
    assert(
      typeof p.Component === 'function',
      `[expo-core-layout-module] ${at}.Component must be a React component.`
    );

    const icon = p.icon;
    const iconOk =
      typeof icon === 'string'
      || typeof icon === 'number' // require('...') in RN
      || (icon && typeof icon === 'object'); // { uri: 'https://...' } etc
    assert(iconOk, `[expo-core-layout-module] ${at}.icon must be an emoji string or an image source.`);

    const k = p.key.trim();
    assert(!keys.has(k), `[expo-core-layout-module] Duplicate page key: "${k}". Keys must be unique.`);
    keys.add(k);
  });

  return safePages.map((p) => ({ ...p, key: String(p.key).trim(), title: String(p.title).trim() }));
}

function resolveInitialIndex({ pages, initialPageKey }) {
  if (typeof initialPageKey === 'string' && initialPageKey.trim()) {
    const idx = pages.findIndex((p) => p.key === initialPageKey.trim());
    if (idx >= 0) return idx;
  }
  return 0;
}

/**
 * @param {{
 *  pages: Array<{ key: string, title: string, icon: any, Component: any, initialProps?: any }>,
 *  initialPageKey?: string,
 *  onPageChange?: (pageKey: string) => void,
 *  maxPages?: number
 * }} params
 */
export function useCoreLayoutLogic({ pages, initialPageKey, onPageChange, maxPages }) {
  const validatedPages = useMemo(() => validatePagesV1({ pages, maxPages }), [pages, maxPages]);
  const initialIndex = useMemo(
    () => resolveInitialIndex({ pages: validatedPages, initialPageKey }),
    [validatedPages, initialPageKey]
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const activePage = validatedPages[activeIndex] ?? validatedPages[0];
  const activePageKey = activePage?.key ?? validatedPages[0].key;

  // Keep state safe if config changes (e.g. pages removed).
  useEffect(() => {
    if (activeIndex < validatedPages.length) return;
    setActiveIndex(0);
  }, [activeIndex, validatedPages.length]);

  const setActiveByIndex = useCallback(
    (nextIndex) => {
      const idx = typeof nextIndex === 'number' ? nextIndex : 0;
      if (idx < 0 || idx >= validatedPages.length) return;
      setActiveIndex(idx);
      if (typeof onPageChange === 'function') onPageChange(validatedPages[idx].key);
    },
    [validatedPages, onPageChange]
  );

  const setActiveByKey = useCallback(
    (key) => {
      const k = typeof key === 'string' ? key : '';
      const idx = validatedPages.findIndex((p) => p.key === k);
      if (idx === -1) return;
      setActiveByIndex(idx);
    },
    [validatedPages, setActiveByIndex]
  );

  const handlersByKey = useMemo(() => {
    const map = {};
    validatedPages.forEach((p, idx) => {
      map[p.key] = () => setActiveByIndex(idx);
    });
    return map;
  }, [validatedPages, setActiveByIndex]);

  return {
    pages: validatedPages,
    activeIndex,
    activePage,
    activePageKey,
    setActiveByIndex,
    setActiveByKey,
    handlersByKey,
  };
}


