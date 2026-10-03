import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a length — 16 or more characters is a good default.", "Pick the character types the website allows.", "Copy one of the generated passwords into your password manager."],
  sections: [
    {
      heading: "What makes a password strong",
      body: <p>Strength comes from unpredictability, measured in bits of entropy: length × log₂(number of possible characters). Every extra character multiplies the number of guesses an attacker needs. A random 16-character password using letters and numbers has about 95 bits — far beyond what can be brute-forced.</p>,
    },
    {
      heading: "Truly random",
      body: <p>Passwords are generated with your browser&apos;s cryptographically secure random number generator, using rejection sampling so every character is equally likely. Each password is guaranteed to contain at least one character from every type you select.</p>,
    },
    {
      heading: "Good habits",
      body: (
        <ul>
          <li>Use a different password for every account — a password manager makes this practical.</li>
          <li>Turn on two-factor authentication wherever possible.</li>
          <li>Never reuse your email password anywhere else; it can reset all your other accounts.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Is it safe to generate passwords on a website?", a: "This generator runs entirely in your browser; nothing is transmitted or logged. You can even disconnect from the internet after the page loads." },
    { q: "How long should my password be?", a: "At least 12 characters; 16–20 is better. Length matters more than adding symbols." },
  ],
};

export default content;
