import { Readability } from '@mozilla/readability'
import { LinkEntry, PageDescription } from './types'

const getAbsoluteURL = (baseURL: string, href: string) => {
    const isAbsolute =
        href.startsWith('http:') ||
        href.startsWith('https:') ||
        href.startsWith('//')

    if (isAbsolute) return href

    try {
        const url = new URL(href, baseURL)
        return url.href
    } catch (e) {
        console.error(e)
        return null
    }
}

const getDocument = (page: PageDescription) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(page.htmlContent, 'text/html')
    const baseEl = document.createElement('base')
    baseEl.href = page.baseURL
    doc.head.append(baseEl)

    return doc
}

type AnyAnchorElement = HTMLAnchorElement | SVGAElement

type FilterFunction = (
    doc: Document,
    page: PageDescription
) => AnyAnchorElement[]

const getAnchorHref = (anchor: AnyAnchorElement): string | null => {
    const href = anchor.getAttribute('href')
    if (anchor instanceof SVGAElement) return anchor.href.baseVal
    if (typeof href === 'string') return href

    return href
}

const filters: {
    readability: FilterFunction
    allLinks: FilterFunction
} = {
    readability: (doc: Document, page: PageDescription) => {
        const readableDOM = new Readability<HTMLElement>(doc, {
            serializer: (el: any) => {
                el.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
                    const anchorHref = getAnchorHref(a)
                    if (!anchorHref) return

                    const href = getAbsoluteURL(page.baseURL, anchorHref)

                    if (href) return a.setAttribute('href', href)

                    a.remove()
                })

                return el
            },
        }).parse()

        const allLinkElements =
            readableDOM!.content.querySelectorAll<AnyAnchorElement>('a')!

        return Array.from(allLinkElements)
    },
    allLinks: (doc: Document, page: PageDescription) => {
        return Array.from(doc.querySelectorAll('a'))
    },
}

export type FilterID = keyof typeof filters

export const anchorsToLinkEntries = (
    allLinkElements: AnyAnchorElement[],
    page: PageDescription
): LinkEntry[] => {
    return Array.from(allLinkElements)
        .filter((link) => getAnchorHref(link) && link.textContent)
        .map((link) => {
            const href = getAnchorHref(link)
            if (!href) return null

            const absoluteHref = getAbsoluteURL(page.baseURL, href)

            if (!absoluteHref) return null

            return { href: absoluteHref, text: link.textContent }
        })
        .filter((link) => link && link.href && link.text) as LinkEntry[]
}

export const linksFromDOM = (
    page: PageDescription,
    filterID: FilterID
): LinkEntry[] => {
    console.log(`Filtering links with ${filterID}`)
    const doc = getDocument(page)
    const allLinkElements = filters[filterID](doc, page)
    const allLinks = anchorsToLinkEntries(allLinkElements, page)

    console.log({ allLinks })

    return allLinks
}
