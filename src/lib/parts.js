export const PARTS = [
  {
    id: "map",
    numeral: "00",
    label: "The map",
    short: "How the series is arranged, and the rules of evidence it keeps.",
    bg: "#1c1917",
    soft: "#f3efe8",
  },
  {
    id: "I",
    numeral: "I",
    label: "The question and its terms",
    short: "What the research asks, and the words it needs before the history starts.",
    bg: "#1e4d8c",
    soft: "#e8f1fb",
  },
  {
    id: "II",
    numeral: "II",
    label: "The baseline",
    short: "The style, its history, and the pattern language later claims are measured against.",
    bg: "#0e6e78",
    soft: "#e5f5f6",
  },
  {
    id: "III",
    numeral: "III",
    label: "The inside of a service",
    short: "How a service is shaped, with domain-driven design as the model.",
    bg: "#2c7a45",
    soft: "#e7f6ec",
  },
  {
    id: "IV",
    numeral: "IV",
    label: "Platform beneath, product above",
    short: "Cloud, Kubernetes, PaaS, and the product the customer actually buys.",
    bg: "#c05621",
    soft: "#fdeee6",
  },
  {
    id: "V",
    numeral: "V",
    label: "The yardstick",
    short: "Requirements, and the discipline that still has to hold when the architecture moves.",
    bg: "#6d28d9",
    soft: "#f3eaff",
  },
  {
    id: "VI",
    numeral: "VI",
    label: "The AI system",
    short: "Thirteen ways to arrange a language-model call inside a service.",
    bg: "#b42318",
    soft: "#fdeceb",
  },
  {
    id: "VII",
    numeral: "VII",
    label: "What AI changed",
    short: "Which parts of the 2014 style moved, and which did not.",
    bg: "#854d0e",
    soft: "#fbf4e4",
  },
];

export function partById(id) {
  return PARTS.find((part) => part.id === id) ?? PARTS[0];
}
