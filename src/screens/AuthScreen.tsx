import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Backdrop } from '../ui/Screen';
import { Button, Glass, Txt, Segmented, haptic } from '../ui/primitives';
import { Mark } from '../ui/pieces';

export function AuthScreen() {
  const { login, signup } = useApp();
  const { theme } = useTheme();
  const { c } = theme;
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please provide your email and password');
      haptic.soft();
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please provide your full name');
      haptic.soft();
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(email.trim().toLowerCase(), password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials');
          haptic.soft();
        } else {
          haptic.success();
        }
      } else {
        const res = await signup(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined);
        if (!res.success) {
          setError(res.error || 'Sign up failed');
          haptic.soft();
        } else {
          haptic.success();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      haptic.soft();
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('arshil@example.com');
    setPassword('password123');
    setError(null);
    haptic.tap();
  };

  const fieldStyle = [
    theme.type.body,
    {
      color: c.text,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Backdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top + 24,
            paddingHorizontal: theme.space.xl,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Mark size={72} />
            <Txt v="display" style={{ marginTop: 14 }}>
              CheckD
            </Txt>
            <Txt v="body" tone="secondary" style={{ marginTop: 6, textAlign: 'center' }}>
              Keep the people you love healthy & on track.
            </Txt>
          </View>

          <Glass strong lifted radius={28} style={{ padding: 22, gap: 16 }}>
            <Segmented<'login' | 'signup'>
              options={[
                { value: 'login', label: 'Sign In' },
                { value: 'signup', label: 'Create Account' },
              ]}
              value={mode}
              onChange={(m) => {
                setMode(m);
                setError(null);
              }}
            />

            {error ? (
              <View style={{ backgroundColor: c.dangerSoft, padding: 12, borderRadius: 14 }}>
                <Txt v="footnote" color={c.danger} style={{ textAlign: 'center' }}>
                  {error}
                </Txt>
              </View>
            ) : null}

            {mode === 'signup' && (
              <>
                <View>
                  <Txt v="caption" tone="secondary" style={{ marginBottom: 6 }}>
                    Full Name
                  </Txt>
                  <Glass radius={14} padded={false}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Your full name"
                      placeholderTextColor={c.textTertiary}
                      autoCapitalize="words"
                      style={fieldStyle}
                    />
                  </Glass>
                </View>

                <View>
                  <Txt v="caption" tone="secondary" style={{ marginBottom: 6 }}>
                    Your Contact Number (Phone)
                  </Txt>
                  <Glass radius={14} padded={false}>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+91 98765 43210"
                      placeholderTextColor={c.textTertiary}
                      keyboardType="phone-pad"
                      style={fieldStyle}
                    />
                  </Glass>
                </View>
              </>
            )}

            <View>
              <Txt v="caption" tone="secondary" style={{ marginBottom: 6 }}>
                Email Address
              </Txt>
              <Glass radius={14} padded={false}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={c.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={fieldStyle}
                />
              </Glass>
            </View>

            <View>
              <Txt v="caption" tone="secondary" style={{ marginBottom: 6 }}>
                Password
              </Txt>
              <Glass radius={14} padded={false}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={c.textTertiary}
                  secureTextEntry
                  style={fieldStyle}
                />
              </Glass>
            </View>

            <Button
              label={loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              icon="arrow-forward"
              size="lg"
              disabled={loading}
              onPress={handleSubmit}
              style={{ marginTop: 6 }}
            />

            {mode === 'login' && (
              <Button
                label="Fill Demo Credentials (Arshil)"
                variant="glass"
                size="sm"
                onPress={fillDemo}
              />
            )}
          </Glass>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
