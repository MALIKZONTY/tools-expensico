import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste your text.", "Pick a case style — the result updates instantly.", "Copy or download the converted text."],
  sections: [
    {
      heading: "Writing styles",
      body: (
        <ul>
          <li><strong>Title Case</strong> capitalises major words. Articles, conjunctions and prepositions of three letters or fewer (a, and, of, the, to…) stay lowercase unless they start the title — the convention used by AP style.</li>
          <li><strong>Sentence case</strong> capitalises only the first letter of each sentence. It&apos;s the most readable style for headings in interfaces. Proper nouns will need re-capitalising by hand.</li>
        </ul>
      ),
    },
    {
      heading: "Programming styles",
      body: (
        <ul>
          <li><code>camelCase</code> — JavaScript and Java variables</li>
          <li><code>PascalCase</code> — class and component names</li>
          <li><code>snake_case</code> — Python, Ruby and database columns</li>
          <li><code>kebab-case</code> — URLs, CSS classes and file names</li>
          <li><code>CONSTANT_CASE</code> — constants and environment variables</li>
        </ul>
        ),
    },
  ],
  example: { body: <p><code>user first name</code> becomes <code>userFirstName</code> (camel), <code>user_first_name</code> (snake) and <code>user-first-name</code> (kebab). Existing camelCase input like <code>userFirstName</code> is split back into words correctly.</p> },
  faqs: [{ q: "Does it work with Hindi or other scripts?", a: "Scripts without upper and lower case, such as Devanagari, are left unchanged; word joining for programming styles still works." }],
};

export default content;
