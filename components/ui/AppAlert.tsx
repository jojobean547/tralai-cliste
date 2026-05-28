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
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AppAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

export function AppAlert({ visible, title, message, buttons, onDismiss }: AppAlertProps) {
  const { colors } = useTheme();

  const handleButtonPress = (btn: AlertButton) => {
    onDismiss();
    // Defer onPress so the modal has closed before any follow-up alert is shown
    if (btn.onPress) setTimeout(btn.onPress, 0);
  };

  const buttonTextColor = (btn: AlertButton) => {
    if (btn.style === 'destructive') return colors.error;
    if (btn.style === 'cancel') return colors.textSecondary;
    return colors.primaryGreen;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        {/* Inner Pressable blocks backdrop dismissal when card is tapped */}
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: '#000',
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {!!message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          )}
          <View style={styles.buttonRow}>
            {buttons.map((btn, i) => (
              <Pressable
                key={i}
                onPress={() => handleButtonPress(btn)}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Text
                  style={[
                    styles.buttonBase,
                    { color: buttonTextColor(btn) },
                    btn.style !== 'cancel' && styles.buttonBold,
                  ]}
                >
                  {btn.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    padding: Spacing.xl,
    // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    // Android elevation
    elevation: 8,
  },
  title: {
    fontSize: Typography.heading1,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  message: {
    fontSize: Typography.body,
    fontFamily: 'Inter',
    marginTop: Spacing.sm,
    lineHeight: Typography.body * 1.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xl,
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  buttonBase: {
    fontSize: Typography.body,
    fontFamily: 'Inter',
    paddingVertical: 4,
  },
  buttonBold: {
    fontWeight: '600',
  },
});
