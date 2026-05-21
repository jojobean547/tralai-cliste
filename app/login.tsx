import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
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

  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🛒</Text>
        <Text style={styles.appName}>Tralaí Cliste</Text>
        <Text style={styles.tagline}>An bealach cliste chun siopadóireachta</Text>
        <Text style={styles.taglineEn}>The clever way to shop</Text>
      </View>

      {/* Features list */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featureItem}>✅ Compare prices across Irish supermarkets</Text>
        <Text style={styles.featureItem}>🤖 AI price tag scanning</Text>
        <Text style={styles.featureItem}>🛒 Shopping basket calculator</Text>
        <Text style={styles.featureItem}>🏷️ Deal detection (3 for €5 etc.)</Text>
        <Text style={styles.featureItem}>📡 Works offline</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Sign in with Google */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
        }
      </TouchableOpacity>

      {/* Continue as Guest */}
      <TouchableOpacity
        style={styles.guestButton}
        onPress={continueAsGuest}
      >
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </TouchableOpacity>

      <Text style={styles.guestNote}>
        Guests can browse prices and use the basket calculator.{'\n'}
        Sign in to submit prices and save shopping lists.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f9f9f9' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#27ae60', fontStyle: 'italic', marginBottom: 2 },
  taglineEn: { fontSize: 13, color: '#888' },
  featuresContainer: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  featureItem: { fontSize: 14, color: '#444', marginBottom: 8, lineHeight: 20 },
  error: { color: 'red', marginBottom: 16, textAlign: 'center' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4285F4', padding: 16, borderRadius: 12, width: '100%', marginBottom: 12 },
  googleIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  googleButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  guestButton: { padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', marginBottom: 16 },
  guestButtonText: { fontSize: 16, color: '#444', fontWeight: '500' },
  guestNote: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
});
