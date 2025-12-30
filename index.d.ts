import type { ComponentType } from 'react';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

export type CoreLayoutIcon = string | ImageSourcePropType;

export type CoreLayoutPageConfig = {
  key: string;
  title: string;
  icon: CoreLayoutIcon;
  Component: ComponentType<any>;
  initialProps?: Record<string, unknown>;
};

export type CoreLayoutProps = {
  pages: CoreLayoutPageConfig[];
  initialPageKey?: string;
  onPageChange?: (pageKey: string) => void;
  maxPages?: number;
  enableHaptics?: boolean;
};

export const CoreLayout: ComponentType<CoreLayoutProps>;

export type CoreEntry = 'onboarding' | 'home' | 'auth';

export type CoreLayoutGateProps = {
  resolveEntry: (() => Promise<CoreEntry> | CoreEntry) | CoreEntry;
  renderOnboarding?: (args: { complete: () => void }) => ReactNode;
  renderAuth?: (args: { complete: () => void }) => ReactNode;
  renderLoading?: () => ReactNode;
  coreLayoutProps: CoreLayoutProps;
};

export const CoreLayoutGate: ComponentType<CoreLayoutGateProps>;


