import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Search by number (e.g. 404) or by meaning (e.g. “timeout”).", "Read what the code means and when servers send it."],
  sections: [
    {
      heading: "The five classes",
      body: (
        <ul>
          <li><strong>1xx</strong> — informational; the request is continuing.</li>
          <li><strong>2xx</strong> — success.</li>
          <li><strong>3xx</strong> — redirection; the client must take another step.</li>
          <li><strong>4xx</strong> — client error; the request needs to change before it can succeed.</li>
          <li><strong>5xx</strong> — server error; the request may be fine, but the server failed.</li>
        </ul>
      ),
    },
    {
      heading: "Codes that are often confused",
      body: (
        <ul>
          <li><strong>401 vs 403:</strong> 401 means “who are you?” (not logged in); 403 means “I know who you are, and you can&apos;t do this”.</li>
          <li><strong>301 vs 302 vs 307 vs 308:</strong> 301/308 are permanent, 302/307 temporary; 307/308 guarantee the method (e.g. POST) is kept.</li>
          <li><strong>400 vs 422:</strong> 400 for malformed requests; 422 for well-formed requests with invalid values.</li>
          <li><strong>502 vs 503 vs 504:</strong> bad upstream response, server unavailable, and upstream timeout.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Which codes matter for SEO?", a: "Use 301 or 308 for permanent moves so rankings transfer, 404 or 410 for removed pages, and 503 with Retry-After for planned maintenance so search engines don't drop pages." },
    { q: "Where do these definitions come from?", a: "Most are defined in RFC 9110 (HTTP Semantics, 2022). Others come from the RFC noted on each card." },
  ],
};

export default content;
