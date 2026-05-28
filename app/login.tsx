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
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Could not sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: colors.greenLight, borderColor: colors.borderStrong }]}>
            <Image
              source={require('@/assets/images/tralai_cliste_app_logo_outline_no_bg.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Tralaí Cliste</Text>
          <Text style={[styles.taglineIrish, { color: colors.primaryGreen }]}>An bealach cliste chun siopadóireachta</Text>
          <Text style={[styles.taglineEn, { color: colors.textSecondary }]}>The clever way to shop</Text>
        </View>

        {/* Features */}
        <Card style={styles.featuresCard}>
          {[
            { icon: '🔍', text: 'Compare prices across Irish stores' },
            { icon: '📷', text: 'AI price tag scanning' },
            { icon: '🏷️', text: 'Deal detection (3 for €5)' },
            { icon: '📡', text: 'Works offline' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f.text}</Text>
            </View>
          ))}
        </Card>

        {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

        {/* Sign in with Google */}
        <Button variant="primary" onPress={handleGoogleSignIn} loading={loading} style={styles.buttonSpacing}>
          {!loading && (
            <View style={styles.googleBtnInner}>
              <View style={styles.googleIconCircle}>
                <Text style={[styles.googleIconText, { color: colors.primaryGreen }]}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </View>
          )}
        </Button>

        {/* Continue as Guest */}
        <Button variant="secondary" onPress={continueAsGuest} style={styles.buttonSpacing}>
          Continue as Guest
        </Button>

        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Sign in to submit prices and save shopping lists
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: { width: 160, height: 160, borderRadius: Radii.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  logoImage: { width: 240, height: 240 },
  appName: { fontSize: Typography.heading1, fontWeight: Typography.bold, fontFamily: 'Inter', marginBottom: Spacing.xs },
  taglineIrish: { fontSize: Typography.bodySmall, fontStyle: 'italic', marginBottom: 2, textAlign: 'center' },
  taglineEn: { fontSize: Typography.caption, textAlign: 'center' },
  featuresCard: { width: '100%', marginBottom: Spacing.xl, gap: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIcon: { fontSize: Typography.body },
  featureText: { fontSize: Typography.body, flex: 1 },
  error: { fontSize: Typography.bodySmall, marginBottom: Spacing.md, textAlign: 'center' },
  buttonSpacing: { marginBottom: Spacing.md },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  googleIconCircle: { width: 24, height: 24, borderRadius: Radii.full, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  googleIconText: { fontSize: Typography.bodySmall, fontWeight: Typography.bold, fontFamily: 'Inter' },
  googleBtnText: { fontSize: Typography.body, fontWeight: Typography.semibold, fontFamily: 'Inter', color: '#FFFFFF' },
  note: { fontSize: Typography.caption, textAlign: 'center', lineHeight: 18 },
});
