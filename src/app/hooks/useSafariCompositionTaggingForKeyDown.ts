import { useEffect } from 'react';

const actuallyComposingTag = Symbol("event is actually composing")

export function isTaggedAsComposing(x: object): boolean {
  return actuallyComposingTag in x
}

export function useSafariCompositionTaggingForKeyDown(target: Window, {compositionEndThreshold = 500}: {compositionEndThreshold?: 500} = {}) {
  useEffect(() => {
    let compositionJustEndedAt: number | null = null

    function recordCompositionEnd(evt: CompositionEvent) {
      compositionJustEndedAt = evt.timeStamp
    }

    function interceptAndTagKeyDown(evt: KeyboardEvent) {
      if (compositionJustEndedAt !== null
        && evt.keyCode === 229
        && (evt.timeStamp - compositionJustEndedAt) < compositionEndThreshold) {
        Object.assign(evt, { [actuallyComposingTag]: true })
      }
      compositionJustEndedAt = null
    }

    target.addEventListener('compositionend', recordCompositionEnd, { capture: true })
    target.addEventListener('keydown', interceptAndTagKeyDown, { capture: true })
    return () => {
      target.removeEventListener('compositionend', recordCompositionEnd, { capture: true })
      target.removeEventListener('keydown', interceptAndTagKeyDown, { capture: true })
    }
  }, [target, compositionEndThreshold]);
}