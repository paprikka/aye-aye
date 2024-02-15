import { Readability } from "@mozilla/readability";

export const linksFromDOM = (htmlString: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const readableDOM = new Readability<HTMLElement>(doc, {
    serializer: (el: any) => el,
  }).parse();

  const allLinkElements =
    readableDOM!.content.querySelectorAll<HTMLAnchorElement>("a")!;
  const allLinks = Array.from(allLinkElements).map((link) => {
    return {
      href: link.href,
      text: link.textContent,
    };
  });

  return allLinks;
};
