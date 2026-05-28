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

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { user, isGuest, signOut, signInWithGoogle } = useAuth();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Settings</Text>

        {/* ── Profile ─────────────────────────────── */}
        <Card style={styles.profileCard}>
          {user ? (
            <View style={styles.profileRow}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarInitial, { backgroundColor: colors.primaryGreen }]}>
                  <Text style={styles.avatarInitialText}>
                    {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                {!!user.name && (
                  <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user.name}</Text>
                )}
                {!!user.email && (
                  <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.profileRow}>
              <Text style={styles.guestIcon}>🛒</Text>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.textPrimary }]}>Guest User</Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  Sign in for full access
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* ── Appearance ──────────────────────────── */}
        <SectionTitle>Appearance</SectionTitle>
        <Card style={styles.sectionCard}>
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              disabled
              trackColor={{ false: colors.border, true: colors.primaryGreen }}
              thumbColor={isDark ? colors.greenLight : colors.surface}
            />
          </View>
          <Text style={[styles.settingsNote, { color: colors.textSecondary }]}>
            Follows system setting
          </Text>
        </Card>

        {/* ── About ───────────────────────────────── */}
        <SectionTitle>About</SectionTitle>
        <Card style={styles.sectionCard}>
          <Text style={[styles.aboutAppName, { color: colors.textPrimary }]}>Tralaí Cliste</Text>
          <Text style={[styles.aboutLine, { color: colors.textSecondary }]}>
            Version {APP_VERSION}
          </Text>
          <Text style={[styles.aboutLine, { color: colors.textSecondary }]}>by Cliste CLG</Text>
          <Text style={[styles.aboutLink, { color: colors.primaryGreen }]}>tralaicliste.ie</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.licenceText, { color: colors.textSecondary }]}>
            Open source — GNU Affero General Public License v3.0 (AGPL-3.0)
          </Text>
        </Card>

        {/* ── Account ─────────────────────────────── */}
        <SectionTitle>Account</SectionTitle>
        {user ? (
          <Button variant="danger" onPress={signOut}>
            Sign Out
          </Button>
        ) : (
          <Button variant="primary" onPress={signInWithGoogle}>
            Sign In with Google
          </Button>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
  screenTitle: {
    fontSize: Typography.heading1,
    fontWeight: Typography.bold,
    fontFamily: 'Inter',
    marginBottom: Spacing.xl,
  },

  // Profile
  profileCard: { marginBottom: Spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: Radii.full },
  avatarInitial: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialText: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: Typography.heading3,
    fontWeight: Typography.semibold,
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  profileEmail: { fontSize: Typography.bodySmall, fontFamily: 'Inter' },

  // Sections
  sectionCard: { marginBottom: Spacing.xl },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: { fontSize: Typography.body, fontFamily: 'Inter' },
  settingsNote: {
    fontSize: Typography.tiny,
    fontFamily: 'Inter',
    marginTop: Spacing.xs,
  },

  // About
  aboutAppName: {
    fontSize: Typography.heading3,
    fontWeight: Typography.semibold,
    fontFamily: 'Inter',
    marginBottom: Spacing.xs,
  },
  aboutLine: { fontSize: Typography.body, fontFamily: 'Inter', marginBottom: 2 },
  aboutLink: {
    fontSize: Typography.body,
    fontFamily: 'Inter',
    marginBottom: Spacing.md,
  },
  divider: { height: 1, marginVertical: Spacing.md },
  licenceText: { fontSize: Typography.tiny, fontFamily: 'Inter', lineHeight: 16 },
  guestIcon: { fontSize: 48 },
});
