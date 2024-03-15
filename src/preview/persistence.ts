import { useComputed, useSignal } from '@preact/signals'
import { LinkEntry } from './types'

export const usePersistence = () => {
    const save = (links: LinkEntry[]) => {
        if (!isActive.value)
            throw new Error('Initialise persistence by calling init() first.')

        const linkIDs = links
            .filter((link) => link.isIgnored)
            .map((link) => link.href)

        const selectionJSON = JSON.stringify(linkIDs)
        localStorage.setItem(key.value, selectionJSON)
    }

    const load = (): Set<string> => {
        if (!isActive.value)
            throw new Error('Initialise persistence by calling init() first.')
        const selectionJSON = localStorage.getItem(key.value)

        if (!selectionJSON) return new Set()

        // TODO: handle invalid JSON, perhaps using zod
        const parsed = JSON.parse(selectionJSON) as string[]
        return new Set(parsed)
    }

    const isActive = useSignal(false)
    const key = useSignal('')

    const init = (newSiteURL: string) => {
        key.value = `sonnet:ayeaye:ignoredLinkIDs:${newSiteURL}`
        isActive.value = true
    }

    return {
        save,
        load,
        init,
        isActive,
    }
}
