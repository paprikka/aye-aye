import { Readability } from "@mozilla/readability";
import { PageDescription } from "./types";

const getAbsoluteURL = (baseURL: string, href: string) => {
  const isAbsolute =
    href.startsWith("http:") ||
    href.startsWith("https:") ||
    href.startsWith("//");

  if (isAbsolute) return href;

  try {
    const url = new URL(href, baseURL);
    return url.href;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const linksFromDOM = (page: PageDescription) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(page.htmlContent, "text/html");
  const baseEl = document.createElement("base");
  baseEl.href = page.baseURL;
  doc.head.append(baseEl);
  const readableDOM = new Readability<HTMLElement>(doc, {
    serializer: (el: any) => {
      el.querySelectorAll("a").forEach((a: HTMLAnchorElement) => {
        const href = getAbsoluteURL(page.baseURL, a.href);
        if (href) {
          a.setAttribute("href", href);
        } else {
          a.remove();
        }
      });

      return el;
    },
  }).parse();

  const allLinkElements =
    readableDOM!.content.querySelectorAll<HTMLAnchorElement>("a")!;
  const allLinks = Array.from(allLinkElements)
    .filter((link) => link.href && link.textContent)
    .map((link) => {
      const href = getAbsoluteURL(page.baseURL, link.href);
      if (!href) return null;
      return {
        href: link.href,
        text: link.textContent,
      };
    })
    .filter(Boolean)
    .filter((link) => link.href && link.text);

  return allLinks;
};
