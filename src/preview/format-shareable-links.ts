import { LinkEntry } from "./types";

export type SharingFormat = "links" | "links-and-titles" | "markdown";

export const formatShareableLinks = (
  format: SharingFormat,
  links: LinkEntry[]
) => {
  switch (format) {
    case "links":
      return links.map((link) => link.href).join("\n");
    case "links-and-titles":
      return links.map((link) => `${link.text} - ${link.href}`).join("\n");
    case "markdown":
      return links
        .map((link) => {
          const linkText = link.text
            .replace(/\*/gi, "\\*")
            .replace(/\[/gi, "\\[")
            .replace(/\]/gi, "\\]")
            .replace(/\(/gi, "\\(");

          return `[${linkText}](${link.href})`;
        })
        .join("\n");
  }
};
