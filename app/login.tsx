import { Radii, Spacing, TouchTargets, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
    } catch (e: any) {
      setError('Could not sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* Logo */}
        <View style={s.logoContainer}>
          <View style={s.logoBox}>
            <Image
              source={require('@/assets/images/tralai_cliste_app_logo_no_bg.png')}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={s.appName}>Tralaí Cliste</Text>
          <Text style={s.taglineIrish}>An bealach cliste chun siopadóireachta</Text>
          <Text style={s.taglineEn}>The clever way to shop</Text>
        </View>

        {/* Features */}
        <View style={s.featuresCard}>
          {[
            { icon: '🔍', text: 'Compare prices across Irish stores' },
            { icon: '📷', text: 'AI price tag scanning' },
            { icon: '🏷️', text: 'Deal detection (3 for €5)' },
            { icon: '📡', text: 'Works offline' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {/* Sign in with Google */}
        <TouchableOpacity
          style={s.googleBtn}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={s.googleIconCircle}>
                <Text style={s.googleIconText}>G</Text>
              </View>
              <Text style={s.googleBtnText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Continue as Guest */}
        <TouchableOpacity
          style={s.guestBtn}
          onPress={continueAsGuest}
          activeOpacity={0.85}
        >
          <Text style={s.guestBtnText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={s.note}>
          Sign in to submit prices and save shopping lists
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
    logoBox: { width: 80, height: 80, backgroundColor: c.greenLight, borderRadius: Radii.lg, borderWidth: 1, borderColor: c.borderStrong, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
    logoImage: { width: 60, height: 60 },
    appName: { fontSize: Typography.heading1, fontWeight: Typography.bold, color: c.textPrimary, marginBottom: Spacing.xs },
    taglineIrish: { fontSize: Typography.bodySmall, color: c.primaryGreen, fontStyle: 'italic', marginBottom: 2, textAlign: 'center' },
    taglineEn: { fontSize: Typography.caption, color: c.textSecondary, textAlign: 'center' },
    featuresCard: { width: '100%', backgroundColor: c.surface, borderRadius: Radii.lg, borderWidth: 0.5, borderColor: c.border, padding: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.sm },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    featureIcon: { fontSize: Typography.body },
    featureText: { fontSize: Typography.body, color: c.textSecondary, flex: 1 },
    error: { color: c.error, fontSize: Typography.bodySmall, marginBottom: Spacing.md, textAlign: 'center' },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.primaryGreen, borderRadius: Radii.md, width: '100%', height: TouchTargets.minHeight, marginBottom: Spacing.md, gap: Spacing.md },
    googleIconCircle: { width: 24, height: 24, borderRadius: Radii.full, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
    googleIconText: { fontSize: Typography.bodySmall, fontWeight: Typography.bold, color: c.primaryGreen },
    googleBtnText: { fontSize: Typography.body, fontWeight: Typography.semibold, color: '#FFFFFF' },
    guestBtn: { width: '100%', height: TouchTargets.minHeight, borderRadius: Radii.md, borderWidth: 0.5, borderColor: c.border, backgroundColor: c.surface, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
    guestBtnText: { fontSize: Typography.body, color: c.textPrimary, fontWeight: Typography.medium },
    note: { fontSize: Typography.caption, color: c.textSecondary, textAlign: 'center', lineHeight: 18 },
  });
