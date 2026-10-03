import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: "Expensico's calculators and tools provide information and estimates only. They are not financial, tax or legal advice.",
  path: "/disclaimer",
});

export default function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      intro={
        <p>
          {site.name} provides free tools and explanations to help you work with files and understand money. Please read this disclaimer before relying on any result. It applies to every tool, guide
          and page on {site.domain}.
        </p>
      }
      sections={[
        {
          id: "finance",
          title: "Financial calculators are for information only",
          body: (
            <>
              <p>Our EMI, SIP, FD, RD, salary, PF, GST, tax and other calculators produce estimates using standard formulas and the assumptions shown on each page. They are intended to help you understand and plan — not to give personalised financial, investment, tax or legal advice.</p>
              <ul>
                <li><strong>Results may differ from your bank, employer, fund house or government.</strong> Institutions may round differently, charge fees, use day-count conventions, apply product-specific rules, or change rates.</li>
                <li><strong>Investment returns are not guaranteed.</strong> Market-linked products such as mutual funds can lose value. Past performance does not indicate future returns.</li>
                <li><strong>Tax rules change.</strong> Tax and contribution rates shown reflect our understanding of the rules for the year stated on the calculator. Your actual liability depends on your full circumstances.</li>
                <li><strong>Verify important figures</strong> with the relevant institution, official sources or a qualified professional before making decisions.</li>
              </ul>
              <p>{site.name} is not a bank, NBFC, investment adviser, tax practitioner or broker, and is not registered with SEBI, RBI or any other regulator as such.</p>
            </>
          ),
        },
        {
          id: "tax",
          title: "Tax, GST and statutory rates",
          body: (
            <>
              <p>
                Calculators that depend on government rules — income tax, GST, EPF, professional tax and similar — state the financial year or rule set they use. These rules change, often in the Union
                Budget or through official notifications, and transitional or special provisions may apply to your situation.
              </p>
              <p>
                We update calculators when rules change, but there may be a delay. Before filing a return, issuing an invoice or making a payment, check the current rates on official sources such as the
                Income Tax Department, the GST portal or the EPFO, or consult a qualified professional.
              </p>
            </>
          ),
        },
        {
          id: "examples",
          title: "Examples and illustrations",
          body: <p>Worked examples on tool pages and in guides use illustrative figures — for example a sample loan amount or salary — to show how a calculation works. They are not recommendations, offers or typical results, and the rates used may not match those currently available.</p>,
        },
        { id: "tools", title: "File and developer tools", body: (
            <>
              <p>File conversions and other tools are provided as-is. Some conversions are simplified by design and are labelled accordingly — for example, converting a PDF to Word extracts text and paragraphs but cannot recreate every layout detail. Always review converted files before sharing or submitting them, and keep your originals.</p>
              <p>Developer tools such as the JWT decoder, hash generator and regex tester are intended for development and learning. Don&apos;t paste production secrets, private keys or live tokens into any online tool, including ours, unless you understand the risk.</p>
            </>
          ),
        },
        {
          id: "no-relationship",
          title: "No professional relationship",
          body: <p>Using the website, contacting us or receiving a reply does not create an adviser–client, accountant–client or any other professional relationship. Answers we give about how a tool works are general information, not advice about your circumstances.</p>,
        },
        {
          id: "external",
          title: "External links and advertising",
          body: <p>Pages may link to official sources and other websites for further reading. We don&apos;t control those sites and aren&apos;t responsible for their content. If the website shows advertising, ads are provided by third parties, are labelled as such, and do not mean we endorse or recommend the advertised products. No tool result is influenced by advertising.</p>,
        },
        {
          id: "errors",
          title: "Errors and corrections",
          body: <p>We work hard to keep tools and content accurate, but mistakes can happen. If you believe a result or explanation is wrong, please <Link href="/contact?topic=bug">report it</Link> with the details. We investigate every report and correct confirmed errors.</p>,
        },
        { id: "content", title: "Guides and explanations", body: <p>Guides and explanations are general information written in good faith. They may not cover every situation and may become out of date. If you notice an error, please <Link href="/contact">let us know</Link>.</p> },
        { id: "liability", title: "No liability", body: <p>To the extent permitted by law, {site.operator.name} accepts no responsibility for decisions made or actions taken based on results or information from this website. See our <Link href="/terms">terms of use</Link>.</p> },
      ]}
    />
  );
}
