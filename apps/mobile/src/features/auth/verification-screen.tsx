import { useEffect, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { SignInWithEmailSchema } from '@quilt/contracts';
import { Button, Text, TextField, View, useQuiltTheme } from '@quilt/ui';
import { useAppStore } from '../../state/app-store';
import { AuthLayout } from './components/auth-layout';

export function VerificationScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token =
    typeof params.token === 'string' && params.token.length <= 4096
      ? params.token
      : undefined;
  const signedIn = useAppStore((state) =>
    Boolean(state.session?.user.emailVerified),
  );
  const savedEmail = useAppStore((state) => state.verificationEmail);
  const status = useAppStore((state) => state.verificationStatus);
  const error = useAppStore((state) => state.verificationError);
  const resendAt = useAppStore((state) => state.verificationResendAt);
  const resend = useAppStore((state) => state.resendVerification);
  const verify = useAppStore((state) => state.verifyEmail);
  const [email, setEmail] = useState(savedEmail ?? '');
  const [emailError, setEmailError] = useState<string>();
  const [now, setNow] = useState(Date.now);
  const { colors } = useQuiltTheme();
  const router = useRouter();
  const pending = status === 'sending' || status === 'verifying';
  const seconds = Math.min(60, Math.max(0, Math.ceil((resendAt - now) / 1000)));
  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= resendAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  const confirm = async () => {
    if (!token) return;
    await verify(token);
    // Remove the credential from browser history after the request, including failures.
    router.replace('/verify-email');
  };
  const requestEmail = async () => {
    const result = SignInWithEmailSchema.pick({ email: true }).safeParse({
      email: email.trim(),
    });
    if (!result.success) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(undefined);
    await resend(result.data.email);
  };
  const verified = status === 'verified' && !token;
  return (
    <AuthLayout>
      <View className="gap-6">
        <View className="self-start rounded-lg bg-surfaceMuted p-4">
          <Feather
            name={verified ? 'check-circle' : 'mail'}
            size={28}
            color={colors.primary}
            accessible={false}
          />
        </View>
        <View className="gap-3">
          <Text variant="display" style={{ fontSize: 36, lineHeight: '44px' }}>
            {verified
              ? 'Email confirmed.'
              : token
                ? 'Confirm your email.'
                : 'Check your inbox.'}
          </Text>
          <Text tone="textMuted">
            {verified
              ? 'This email address is confirmed. You can now use it to sign in to Quilt.'
              : token
                ? 'Confirm this email address to finish setting up your Quilt account.'
                : savedEmail
                  ? `Look for a Quilt confirmation email at ${savedEmail}. Open the link to continue.`
                  : 'Open your confirmation email, or request a fresh link below.'}
          </Text>
        </View>
        {verified ? (
          <Button
            label={signedIn ? 'Back to Quilt' : 'Continue to sign in'}
            onPress={() => router.replace(signedIn ? '/home' : '/sign-in')}
          />
        ) : (
          <View className="gap-5">
            {token && (
              <Button
                label="Confirm my email"
                loading={status === 'verifying'}
                disabled={pending}
                onPress={() => {
                  void confirm();
                }}
              />
            )}
            {!token && (
              <Text variant="caption" tone="textMuted">
                The link expires in one hour. If it’s missing, check your spam
                folder.
              </Text>
            )}
            {error && (
              <Text role="alert" tone="danger">
                {error}
              </Text>
            )}
            {status === 'sent' && (
              <Text role="status" aria-live="polite">
                If this address has an unverified account, a fresh confirmation
                link is on its way.
              </Text>
            )}
            <View className="gap-4 border-t border-border pt-5">
              <TextField
                label="Email address"
                placeholder="you@example.com"
                value={email}
                editable={!pending}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                error={emailError}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError(undefined);
                }}
                returnKeyType="send"
                onSubmitEditing={() => {
                  void requestEmail();
                }}
              />
              <Button
                label={
                  seconds > 0 ? `Send again in ${seconds}s` : 'Send a new link'
                }
                variant="secondary"
                loading={status === 'sending'}
                disabled={pending || seconds > 0}
                onPress={() => {
                  void requestEmail();
                }}
              />
            </View>
          </View>
        )}
        {!verified && (
          <Link
            href="/sign-in"
            style={{ alignSelf: 'center', paddingVertical: 12 }}
          >
            <Text variant="label" style={{ color: colors.primary }}>
              ← Back to sign in
            </Text>
          </Link>
        )}
      </View>
    </AuthLayout>
  );
}
