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
} from "@react-email/components";

export interface ResetPasswordEmailProps {
  /** The password reset link */
  url: string;
  /** Product name shown in the copy (defaults to NEXT_PUBLIC_APP_NAME or "Your App") */
  appName?: string;
}

export function ResetPasswordEmail({
  url,
  appName = process.env.NEXT_PUBLIC_APP_NAME || "Your App",
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>
            We received a request to reset the password for your {appName}{" "}
            account. Click the button below to choose a new password.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Reset password
            </Button>
          </Section>
          <Text style={muted}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={link}>{url}</Text>
          <Text style={muted}>
            If you did not request a password reset, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetPasswordEmail;

const main: React.CSSProperties = {
  backgroundColor: "#f6f7f9",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "480px",
  borderRadius: "10px",
  border: "1px solid #e6e8eb",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#111827",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#374151",
};

const buttonContainer: React.CSSProperties = {
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#111827",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 20px",
};

const muted: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#6b7280",
};

const link: React.CSSProperties = {
  fontSize: "12px",
  color: "#2563eb",
  wordBreak: "break-all",
};
