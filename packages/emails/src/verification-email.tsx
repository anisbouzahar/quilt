import {
  EmailButton,
  EmailCard,
  EmailDivider,
  EmailHeading,
  EmailLayout,
  EmailText,
} from '@quilt/ui/email';
import { Link, Section } from 'react-email';
import { themes } from '@quilt/ui/tokens';

export interface VerificationEmailProps {
  name: string;
  verificationURL: string;
}
export function VerificationEmail({
  name,
  verificationURL,
}: VerificationEmailProps) {
  return (
    <EmailLayout preview="Confirm your email to start your household on Quilt.">
      <EmailCard>
        <EmailText>
          {name.trim() ? `Hi ${name.trim()},` : 'Hi there,'}
        </EmailText>
        <EmailHeading>Confirm your email.</EmailHeading>
        <EmailText>
          Confirm this address to finish creating your Quilt account.
        </EmailText>
        <Section style={{ textAlign: 'center', paddingTop: 8 }}>
          <EmailButton label="Confirm my email" href={verificationURL} />
        </Section>
        <EmailText
          muted
          variant="caption"
          style={{ textAlign: 'center', margin: 0 }}
        >
          This link expires in one hour.
        </EmailText>
        <EmailDivider />
        <EmailText muted variant="caption" style={{ margin: 0 }}>
          Didn’t create a Quilt account? You can safely ignore this email.
        </EmailText>
      </EmailCard>
      <EmailText
        muted
        variant="caption"
        style={{ textAlign: 'center', margin: '24px 16px 0' }}
      >
        Button not opening?{' '}
        <Link
          href={verificationURL}
          style={{ color: themes.light.primary, textDecoration: 'underline' }}
        >
          Use the confirmation link.
        </Link>
      </EmailText>
    </EmailLayout>
  );
}
