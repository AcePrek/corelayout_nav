/**
 * CoreLayoutGate.ui.js
 *
 * ✅ EDIT UI HERE (safe)
 * - All gate visuals (loading, fallbacks) live here.
 * - Do not change state/flow logic here (that lives in CoreLayoutGate.logic.js).
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CoreLayout } from './CoreLayout.ui';
import { CORE_ENTRY, useCoreLayoutGateLogic } from './CoreLayoutGate.logic';

/**
 * @param {{
 *  resolveEntry: (() => (Promise<'onboarding'|'home'|'auth'>|'onboarding'|'home'|'auth')) | 'onboarding'|'home'|'auth',
 *  renderOnboarding?: ({ complete: () => void }) => React.ReactNode,
 *  renderAuth?: ({ complete: () => void }) => React.ReactNode,
 *  renderLoading?: () => React.ReactNode,
 *  coreLayoutProps: any
 * }} props
 */
export function CoreLayoutGate(props) {
  const gate = useCoreLayoutGateLogic({
    resolveEntry: props.resolveEntry,
    renderOnboarding: props.renderOnboarding,
    renderAuth: props.renderAuth,
  });

  if (gate.status === 'loading') {
    if (typeof props.renderLoading === 'function') return props.renderLoading();
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (gate.status === 'error') {
    const message = gate.error instanceof Error ? gate.error.message : 'Unknown error';
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
    );
  }

  if (gate.entry === CORE_ENTRY.ONBOARDING) {
    return props.renderOnboarding({ complete: gate.complete });
  }

  if (gate.entry === CORE_ENTRY.AUTH) {
    return props.renderAuth({ complete: gate.complete });
  }

  return <CoreLayout {...props.coreLayoutProps} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6B7280',
  },
});


