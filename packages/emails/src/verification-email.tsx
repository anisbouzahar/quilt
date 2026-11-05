import {
  EmailButton,
  EmailCard,
  EmailHeading,
  EmailLayout,
  EmailText,
} from '@quilt/ui/email';

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
        <EmailHeading>Confirm your email.</EmailHeading>
        <EmailText>
          {name.trim() ? `Hi ${name.trim()},` : 'Hi there,'}
        </EmailText>
        <EmailText>
          Confirm this email address to finish setting up your Quilt account.
          Then you can start a space for the spending and plans you share.
        </EmailText>
        <EmailButton label="Confirm my email" href={verificationURL} />
        <EmailText muted variant="caption">
          This link expires in one hour. If you didn’t create a Quilt account,
          you can ignore this email.
        </EmailText>
        <EmailText muted variant="caption">
          Button not opening? Copy this link into your browser:
        </EmailText>
        <EmailText
          variant="caption"
          style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}
        >
          {verificationURL}
        </EmailText>
      </EmailCard>
    </EmailLayout>
  );
}
