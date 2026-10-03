import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that apply when you use Expensico's free online tools, including acceptable use, file handling, limitations and liability.",
  path: "/terms",
});

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/terms"
      intro={<p>These terms apply to your use of {site.name} ({site.domain}), operated by {site.operator.name}. By using the website you agree to them. If you don&apos;t agree, please don&apos;t use the website.</p>}
      sections={[
        { id: "service", title: "The service", body: <p>{site.name} provides free online tools for working with files, documents, finance calculations, text and code, along with guides that explain them. No account is required. We may add, change or remove tools at any time, for example to fix problems, improve accuracy or respond to changes in law or technology.</p> },
        { id: "eligibility", title: "Who may use the website", body: <p>You may use the website if you are able to form a binding agreement under the law that applies to you. If you are under 18, please use the website with the involvement of a parent or guardian. If you use the website on behalf of an organisation, you confirm you are allowed to accept these terms for it.</p> },
        {
          id: "acceptable-use",
          title: "Acceptable use",
          body: (
            <>
              <p>You may use the tools for personal and commercial purposes. You agree not to:</p>
              <ul>
                <li>use the website to process content you don&apos;t have the right to use, or in a way that breaks any law;</li>
                <li>upload malware or files designed to harm our systems or other users;</li>
                <li>attempt to disrupt, overload, probe or bypass the security of the website or its processing services;</li>
                <li>use automated means to access the website in a way that places excessive load on it, or to generate artificial traffic, ad impressions or ad clicks;</li>
                <li>copy or resell the website or its tools as your own service.</li>
              </ul>
            </>
          ),
        },
        {
          id: "your-files",
          title: "Your files and content",
          body: (
            <>
              <p>You keep all rights to the files and content you use with our tools. Most tools process files in your browser and we never receive them. Where a tool is marked as uploading files, you give us permission to process the file solely to perform the conversion you requested; it is deleted immediately afterwards, as described in our <Link href="/privacy-policy">privacy policy</Link>.</p>
              <p>You are responsible for keeping your own copies. Data saved in your browser (such as notes) can be lost if browser data is cleared; please export important information.</p>
            </>
          ),
        },
        {
          id: "accuracy",
          title: "Accuracy and limitations",
          body: (
            <>
              <p>We work hard to make the tools accurate and we explain their limitations, but they are provided &ldquo;as is&rdquo;. Conversions labelled &ldquo;basic&rdquo; simplify content by design, and complex files may not convert perfectly. Always check results before relying on them.</p>
              <p>Calculators provide estimates for information only and are not financial, tax, legal or professional advice. See our <Link href="/disclaimer">disclaimer</Link>.</p>
            </>
          ),
        },
        { id: "availability", title: "Availability", body: <p>We aim to keep the website available but don&apos;t guarantee uninterrupted access. We may suspend the website or individual tools for maintenance, security or other reasons, and we may limit usage (for example file sizes or request rates) to keep the service reliable for everyone.</p> },
        { id: "ip", title: "Intellectual property", body: <p>The website&apos;s design, text, code and branding belong to {site.operator.name} or its licensors. Open-source libraries we use remain under their own licences. You may link to any page of the website.</p> },
        {
          id: "liability",
          title: "Limitation of liability",
          body: <p>To the fullest extent permitted by law, {site.operator.name} is not liable for any indirect, incidental or consequential loss, or for loss of data, profits or business, arising from your use of the website or reliance on any result it produces. Nothing in these terms excludes liability that cannot be excluded by law.</p>,
        },
        {
          id: "feedback",
          title: "Feedback and suggestions",
          body: <p>If you send us ideas, suggestions or corrections, you agree that we may use them to improve the website without any obligation to you. We never publish your name or message without asking first.</p>,
        },
        {
          id: "third-party",
          title: "Third-party services and open-source software",
          body: <p>The website relies on hosting, email and (where enabled) analytics and advertising providers, and on open-source libraries such as PDF.js and SheetJS. These are provided under their own terms and licences. We choose providers carefully but aren&apos;t responsible for services we don&apos;t control.</p>,
        },
        {
          id: "suspension",
          title: "Suspension of access",
          body: <p>We may block or limit access for anyone who breaks these terms, attempts to abuse the website or its processing services, or generates automated or artificial traffic. Where reasonable, we will act only against the abusive activity rather than the website as a whole.</p>,
        },
        { id: "ads", title: "Advertising and links", body: <p>The website may display advertising and link to other websites. Ads are clearly labelled and do not mean we endorse the advertiser. We aren&apos;t responsible for the content, products or practices of advertisers or linked sites, and any dealings you have with them are between you and them.</p> },
        { id: "changes", title: "Changes to these terms", body: <p>We may update these terms. The effective date at the top shows when they last changed. Continued use of the website after changes means you accept the updated terms.</p> },
        { id: "severability", title: "Severability and entire agreement", body: <p>If any part of these terms is found to be unenforceable, the rest remains in effect. These terms, together with our <Link href="/privacy-policy">privacy policy</Link>, <Link href="/cookie-policy">cookie policy</Link> and <Link href="/disclaimer">disclaimer</Link>, are the entire agreement between you and us about the website.</p> },
        { id: "law", title: "Governing law", body: <p>These terms are governed by the laws of {site.operator.jurisdiction}. Disputes are subject to the jurisdiction of the courts specified there.</p> },
        { id: "contact", title: "Contact", body: <p>Questions about these terms? Contact us at {site.contactEmail} or via the <Link href="/contact">contact page</Link>.</p> },
      ]}
    />
  );
}
