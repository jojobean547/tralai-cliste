// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Tralaí Cliste — Irish community grocery price comparison app
// Copyright (C) 2026 Tralaí Cliste Contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import { Radii, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger' | 'purple' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant: Variant;
  size?: Size;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const HEIGHT: Record<Size, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

const FONT_SIZE: Record<Size, number> = {
  sm: Typography.bodySmall,
  md: Typography.body,
  lg: Typography.body,
};

export function Button({
  variant,
  size = 'lg',
  onPress,
  disabled = false,
  loading = false,
  children,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary:   { bg: colors.buttonPrimary,  text: colors.buttonPrimaryText },
    secondary: { bg: colors.surface,       text: colors.textPrimary,   border: colors.border },
    danger:    { bg: colors.errorBg,       text: colors.error,         border: colors.errorBorder },
    purple:    { bg: colors.accentPurple,  text: colors.textInverse },
    ghost:     { bg: 'transparent',        text: colors.textSecondary },
  };

  const { bg, text, border } = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          backgroundColor: bg,
          borderColor: border ?? 'transparent',
          borderWidth: border ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : typeof children === 'string' ? (
        <Text style={[styles.label, { color: text, fontSize: FONT_SIZE[size] }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: Typography.semibold,
    textAlign: 'center',
  },
});
