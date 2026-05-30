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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const APP_VERSION = '1.0.0';

const DENSITY_LABELS = { standard: 'Standard', compact: 'Compact' } as const;
const DENSITY_DESCRIPTIONS = {
  standard: 'Larger text — easier to read',
  compact:  'Smaller text — more on screen',
} as const;

export default function SettingsScreen() {
  const { user, isGuest, signOut, signInWithGoogle } = useAuth();
  const { colors, isDark, density, setDensity, typography, spacing, radii } = useTheme();
  const { userClubCards, availableClubCards, toggleClubCard } = useUserPreferences();

  const styles = StyleSheet.create({
    safe:      { flex: 1 },
    container: { padding: spacing.xl, paddingBottom: spacing.xxl },
    screenTitle: {
      fontSize: typography.heading1,
      fontWeight: typography.bold,
      fontFamily: 'Inter',
      marginBottom: spacing.xl,
    },

    // Profile
    profileCard:       { marginBottom: spacing.xl },
    profileRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
    avatar:            { width: 56, height: 56, borderRadius: radii.full },
    avatarInitial:     { width: 56, height: 56, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center' },
    avatarInitialText: { fontSize: typography.heading2, fontWeight: typography.bold, fontFamily: 'Inter', color: '#FFFFFF' },
    profileInfo:       { flex: 1 },
    profileName:       { fontSize: typography.heading3, fontWeight: typography.semibold, fontFamily: 'Inter', marginBottom: 2 },
    profileEmail:      { fontSize: typography.bodySmall, fontFamily: 'Inter' },
    guestIcon:         { fontSize: 48 },
    profileIcon:       { width: spacing.xxl * 2, height: spacing.xxl * 2, borderRadius: radii.md},

    // Sections
    sectionCard:   { marginBottom: spacing.xl },
    settingsRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingsLabel: { fontSize: typography.body, fontFamily: 'Inter' },
    settingsNote:  { fontSize: typography.tiny, fontFamily: 'Inter', marginTop: spacing.xs },

    // Display density
    densityRow:       { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    densityPill:      { flex: 1, borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center' },
    densityPillLabel: { fontSize: typography.body, fontFamily: 'Inter', textAlign: 'center' },

    // Club cards
    clubCardSubtitle: { fontSize: typography.bodySmall, fontFamily: 'Inter', marginBottom: spacing.md },
    clubCardItem:     { marginBottom: spacing.sm },
    clubCardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clubCardInfo:     { flex: 1 },
    clubCardName:     { fontSize: typography.body, fontWeight: '600', fontFamily: 'Inter' },
    clubCardStore:    { fontSize: typography.caption, fontFamily: 'Inter', marginTop: 2 },

    // About
    aboutAppName: { fontSize: typography.heading3, fontWeight: typography.semibold, fontFamily: 'Inter', marginBottom: spacing.xs },
    aboutLine:    { fontSize: typography.body, fontFamily: 'Inter', marginBottom: 2 },
    aboutLink:    { fontSize: typography.body, fontFamily: 'Inter', marginBottom: spacing.md },
    divider:      { height: 1, marginVertical: spacing.md },
    licenceText:  { fontSize: typography.tiny, fontFamily: 'Inter', lineHeight: 16 },

    // Account buttons (outline style)
    accountSignIn:     { backgroundColor: isDark ? 'transparent' : colors.greenTint, borderWidth: 2, borderColor: isDark ? colors.buttonPrimary : colors.primaryGreen, marginBottom: spacing.xl },
    accountSignInText: { color: isDark ? colors.buttonPrimary : colors.primaryGreen, fontWeight: '700', fontFamily: 'Inter', fontSize: typography.body },
    accountSignOut:     { backgroundColor: isDark ? 'transparent' : colors.errorBg, borderWidth: 2, borderColor: colors.error },
    accountSignOutText: { color: colors.error, fontWeight: '600', fontFamily: 'Inter', fontSize: typography.body },
  });

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
              <Image
                source={require('@/assets/images/app_icon_dark.png')}
                style={styles.profileIcon}
                resizeMode="contain"
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.textPrimary }]}>Guest User</Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  Sign in for full access
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* ── Account ─────────────────────────────── */}
        <SectionTitle>Account</SectionTitle>
        {user ? (
          <Button variant="danger" onPress={signOut} style={styles.accountSignOut}>
            <Text style={styles.accountSignOutText}>Sign Out</Text>
          </Button>
        ) : (
          <Button variant="primary" onPress={signInWithGoogle} style={styles.accountSignIn}>
            <Text style={styles.accountSignInText}>Sign In with Google</Text>
          </Button>
        )}

        {/* ── My Club Cards ───────────────────────── */}
        <SectionTitle>My Club Cards</SectionTitle>
        <Text style={[styles.clubCardSubtitle, { color: colors.textSecondary }]}>
          Select the loyalty cards you have — we'll use these prices in your basket total
        </Text>
        {availableClubCards.map(card => {
          const active = userClubCards.includes(card.id);
          return (
            <Card key={card.id} style={styles.clubCardItem}>
              <View style={styles.clubCardRow}>
                <View style={styles.clubCardInfo}>
                  <Text style={[styles.clubCardName, { color: colors.textPrimary }]}>{card.name}</Text>
                  <Text style={[styles.clubCardStore, { color: colors.textSecondary }]}>{card.store}</Text>
                </View>
                <Switch
                  value={active}
                  onValueChange={() => toggleClubCard(card.id)}
                  trackColor={{ false: colors.border, true: colors.primaryGreen }}
                  thumbColor={colors.textPrimary}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </Card>
          );
        })}

        {/* ── Display Size ──────────────────────────── */}
        <SectionTitle>Display Size</SectionTitle>
        <Card style={styles.sectionCard}>
          <View style={styles.densityRow}>
            {(['standard', 'compact'] as const).map(option => {
              const isSelected = density === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setDensity(option)}
                  style={[
                    styles.densityPill,
                    isSelected
                      ? { backgroundColor: isDark ? 'transparent' : colors.greenTint, borderWidth: 2, borderColor: isDark ? colors.buttonPrimary : colors.primaryGreen }
                      : { backgroundColor: isDark ? 'transparent' : colors.surface, borderWidth: 1, borderColor: colors.border },
                  ]}
                >
                  <Text style={[
                    styles.densityPillLabel,
                    {
                      color: isSelected ? (isDark ? colors.buttonPrimary : colors.primaryGreen) : colors.textSecondary,
                      fontWeight: isSelected ? '700' : typography.regular,
                    },
                  ]}>
                    {DENSITY_LABELS[option]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.settingsNote, { color: colors.textSecondary }]}>
            {DENSITY_DESCRIPTIONS[density]}
          </Text>
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

      </ScrollView>
    </SafeAreaView>
  );
}
