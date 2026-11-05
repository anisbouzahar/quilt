import type { CSSProperties, PropsWithChildren } from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';
import { radii, spacing, themes, typography } from './tokens.js';

const colors = themes.light;
const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

/** Email adapters share Quilt's design tokens without loading native UI code. */
export function EmailLayout({
  preview,
  children,
}: PropsWithChildren<{ preview: string }>) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          fontFamily,
          margin: 0,
          padding: `${spacing['2xl']}px ${spacing.lg}px`,
        }}
      >
        <Container style={{ maxWidth: 520, margin: '0 auto' }}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: -1,
              margin: '0 0 24px',
            }}
          >
            Quilt
          </Text>
          {children}
          <EmailText muted variant="caption" style={{ marginTop: 24 }}>
            Shared spending. Clearer plans.
          </EmailText>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailCard({ children }: PropsWithChildren) {
  return (
    <Section
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding: spacing['2xl'],
      }}
    >
      {children}
    </Section>
  );
}

export function EmailHeading({ children }: PropsWithChildren) {
  return (
    <Heading
      as="h1"
      style={{
        fontFamily,
        fontSize: typography.heading.fontSize,
        lineHeight: `${typography.heading.lineHeight}px`,
        fontWeight: 500,
        letterSpacing: typography.heading.letterSpacing,
        color: colors.text,
        margin: '0 0 16px',
      }}
    >
      {children}
    </Heading>
  );
}

export function EmailText({
  children,
  muted = false,
  variant = 'body',
  style,
}: PropsWithChildren<{
  muted?: boolean;
  variant?: 'body' | 'caption';
  style?: CSSProperties;
}>) {
  const type = typography[variant];
  return (
    <Text
      style={{
        fontFamily,
        fontSize: type.fontSize,
        lineHeight: `${type.lineHeight}px`,
        color: muted ? colors.textMuted : colors.text,
        margin: '0 0 16px',
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailButton({ label, href }: { label: string; href: string }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: colors.primary,
        color: colors.onPrimary,
        border: `1px solid ${colors.primaryPressed}`,
        borderRadius: radii.md,
        fontFamily,
        fontSize: typography.label.fontSize,
        fontWeight: 600,
        padding: `${spacing.md}px ${spacing.xl}px`,
        textDecoration: 'none',
        textAlign: 'center',
        margin: '8px 0 24px',
      }}
    >
      {label}
    </Button>
  );
}
