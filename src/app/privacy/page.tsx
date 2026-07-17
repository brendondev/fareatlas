import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, stores and uses your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalShell
      lead={`What ${SITE.name} collects, why, and what we do with it. Written to describe what the product actually does today — not what it might do later.`}
      title="Privacy Policy"
    >
      <LegalSection heading="What we collect">
        <p>We collect the minimum needed to run the product:</p>
        <ul>
          <li>
            <strong>Your email address</strong>, when you create an account or
            ask us to watch a flight route for you.
          </li>
          <li>
            <strong>Your account password</strong>, stored only as a one-way
            hash. We cannot read it, and neither can anyone who obtains our
            database.
          </li>
          <li>
            <strong>The routes and programs you follow</strong> — origin,
            destination, cabin and travel dates — so we can tell you when
            something changes.
          </li>
          <li>
            <strong>Standard server logs</strong>, including IP address, kept by
            our hosting provider for security and abuse prevention.
          </li>
        </ul>
        <p>
          We do not run advertising trackers, third-party analytics, or
          behavioural profiling, and we do not buy data about you.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We set one cookie, and only after you sign in: a session cookie that
          keeps you logged in. It is <code>HttpOnly</code> (unreadable by
          JavaScript) and <code>SameSite=Lax</code>. There are no advertising or
          tracking cookies. Signed out, we set no cookies at all.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          We do not sell your personal information, and we do not share it for
          anyone else&apos;s marketing. We rely on a small number of processors
          to operate:
        </p>
        <ul>
          <li>
            <strong>Our hosting and database providers</strong>, which store the
            data described above on our behalf.
          </li>
          <li>
            <strong>Seats.aero</strong>, which supplies award seat availability.
            We send it route and date queries only — never your identity, email
            or account.
          </li>
          <li>
            <strong>Our email provider</strong>, when we send you an account
            email or an alert you asked for.
          </li>
        </ul>
        <p>
          We may also disclose information where we are required to by law.
        </p>
      </LegalSection>

      <LegalSection heading="Where it is stored">
        <p>
          Your data is stored on servers operated by our hosting providers.
          Some of these providers operate infrastructure outside Australia, so
          your information may be stored or processed overseas.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Account data is kept while your account is open. Route watches are
          kept until you delete them or close your account. Delete your account
          and we remove your personal information, except where we must retain
          something to meet a legal obligation.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can ask us for a copy of the personal information we hold about
          you, ask us to correct it, or ask us to delete it. Email{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> and
          we will respond within a reasonable period.
        </p>
        <p>
          If you are unhappy with how we have handled your information, you can
          complain to us first, and then to the Office of the Australian
          Information Commissioner at{" "}
          <a href="https://www.oaic.gov.au" rel="noreferrer" target="_blank">
            oaic.gov.au
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If we change this policy in a way that materially affects you, we will
          say so on this page and update the date above.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
