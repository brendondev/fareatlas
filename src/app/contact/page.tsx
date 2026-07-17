import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team.`,
};

export default function ContactPage() {
  return (
    <LegalShell
      lead="Found an offer we missed? Spotted a points price that looks wrong? Tell us — corrections are the fastest way to make this better."
      title="Contact"
    >
      <LegalSection heading="Email us">
        <p>
          <a
            className="btn btn-primary !text-white"
            href={`mailto:${LEGAL.contactEmail}`}
          >
            {LEGAL.contactEmail}
          </a>
        </p>
        <p>
          We read everything. Useful things to include: the program, the route,
          and a link to the offer if you have one.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting bad data">
        <p>
          Award seat data comes from Seats.aero and offers are researched by
          hand, so both can go stale. If something on the site disagrees with
          the airline or program, the airline or program is right — and we want
          to know so we can fix it.
        </p>
      </LegalSection>

      <LegalSection heading="Privacy and your data">
        <p>
          To request a copy of your data, correct it, or delete it, email the
          address above. See the{" "}
          <Link href="/privacy">Privacy Policy</Link> for what we hold and why.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
