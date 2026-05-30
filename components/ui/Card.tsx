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

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'default' | 'highlight' | 'danger';

interface CardProps {
  variant?: Variant;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ variant = 'default', children, onPress, style }: CardProps) {
  const { colors, spacing, radii } = useTheme();

  const variantStyles: Record<Variant, { bg: string; border: string; borderWidth: number }> = {
    default:   { bg: colors.surface,   border: colors.border,       borderWidth: 1 },
    highlight: { bg: colors.surface,   border: colors.primaryGreen, borderWidth: 1.5 },
    danger:    { bg: colors.errorBg,   border: colors.errorBorder,  borderWidth: 1 },
  };

  const { bg, border, borderWidth } = variantStyles[variant];

  const styles = StyleSheet.create({
    base: {
      borderRadius: radii.lg,
      padding: spacing.lg,
    },
  });

  const containerStyle = [
    styles.base,
    { backgroundColor: bg, borderColor: border, borderWidth },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}
