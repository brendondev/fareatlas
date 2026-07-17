import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms you agree to when you use ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <LegalShell
      lead={`The rules for using ${SITE.name}. Short, because the product is simple: we show you information, and you decide what to do with it.`}
      title="Terms of Service"
    >
      <LegalSection heading="What FareAtlas is">
        <p>
          {SITE.name} is an information service. We surface loyalty program
          offers, award seat availability and cash fares so you can compare
          them. We are not a travel agent, we do not sell flights, and we are
          not affiliated with, endorsed by, or acting for Qantas, Virgin
          Australia, Everyday Rewards, Flybuys or any airline or program named
          on this site. All trade marks belong to their owners.
        </p>
      </LegalSection>

      <LegalSection heading="Accuracy — please read this one">
        <p>
          Points prices, seat availability, fares and offer terms change
          constantly and without notice, and the data we display comes from
          third parties and from our own editorial research. It can be
          incomplete, out of date, or wrong.
        </p>
        <p>
          <strong>
            Always confirm the details with the airline or program before you
            book, transfer points, or spend money.
          </strong>{" "}
          Anything you see here is information to check, not advice to act on.
          We do not give financial, travel or tax advice, and nothing on this
          site takes your personal circumstances into account.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Keep your password to yourself and tell us promptly if you think
          someone else has access to your account. You are responsible for
          activity under your account. Don&apos;t scrape the site, hammer it
          with automated requests, resell our data, or try to get around
          plan limits — we may suspend accounts that do.
        </p>
      </LegalSection>

      <LegalSection heading="Plans and payment">
        <p>
          The free plan is free, and we are not obliged to keep any particular
          feature on it forever. Premium is not yet available for purchase. If
          and when it is, its pricing and billing terms will be set out before
          you pay for anything.
        </p>
      </LegalSection>

      <LegalSection heading="Availability">
        <p>
          We aim to keep the service running but we do not promise it will be
          uninterrupted or error-free, and we may change or discontinue features
          at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          Nothing in these terms excludes, restricts or modifies any guarantee,
          right or remedy you have under the Australian Consumer Law that cannot
          lawfully be excluded. Where we are permitted to limit our liability,
          we limit it to resupplying the service or paying the cost of having it
          resupplied.
        </p>
        <p>
          Subject to that, we are not liable for losses arising from your
          reliance on information displayed on the site — including a booking
          you missed, points you transferred, or a fare that changed.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of Australia, and you and we
          submit to the courts of that jurisdiction.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
