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
    {
      heading: "Fun and fix-up styles",
      body: (
        <ul>
          <li><code>dot.case</code> — configuration keys and some logging systems, such as <code>app.server.port</code>.</li>
          <li><strong>aLtErNaTiNg</strong> — the mocking meme style; fine for chat, not for anything formal.</li>
          <li><strong>iNVERSE</strong> — swaps every letter&apos;s case, which instantly fixes text typed with Caps Lock on by mistake.</li>
          <li><strong>UPPERCASE</strong> and <strong>lowercase</strong> — for headings, form fields that demand capitals, or tidying email addresses before comparing them.</li>
        </ul>
      ),
    },
    {
      heading: "Common jobs",
      body: (
        <p>
          Turn a column header like <code>Customer Phone Number</code> into <code>customer_phone_number</code> for a database, convert a page title into a <code>kebab-case</code> URL slug, rename a
          variable to match a project&apos;s style, or bring an all-caps email from someone back to readable sentence case. Paste as much text as you like — each line is converted, and the result
          updates as you type.
        </p>
      ),
    },
  ],
  example: { body: <p><code>user first name</code> becomes <code>userFirstName</code> (camel), <code>user_first_name</code> (snake) and <code>user-first-name</code> (kebab). Existing camelCase input like <code>userFirstName</code> is split back into words correctly.</p> },
  faqs: [
    { q: "Does it work with Hindi or other scripts?", a: "Scripts without upper and lower case, such as Devanagari, are left unchanged; word joining for programming styles still works." },
    { q: "Is my text sent anywhere?", a: "No. Conversion happens in your browser as you type." },
    { q: "Why did Title Case leave some words lowercase?", a: "Short articles, conjunctions and prepositions (a, an, the, and, of, to, in…) stay lowercase in the middle of a title, following AP style. The first word is always capitalised." },
  ],
};

export default content;
