// useAutoTranslate — automatically swaps visible English text for Sinhala
// inside a container, using the dictionary in sinhalaDictionary.js.
// Works by walking rendered DOM text nodes (and placeholder attributes)
// after each render, so individual screens don't need to be rewritten —
// just add new phrases to the dictionary file as needed.

import { useEffect, useRef } from "react";
import { sinhalaDictionary } from "./sinhalaDictionary";

// Sort phrases longest-first so more specific matches win over shorter
// generic ones (e.g. "Active Permit" before "Active").
const phrases = Object.keys(sinhalaDictionary).sort((a,b)=>b.length-a.length);

function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Only require a word-boundary on a side of the phrase that actually starts/
// ends with a word character (letter/digit/underscore). This is what stops
// "Sand" from matching inside "SandPass" — but still lets phrases ending in
// punctuation like "..." or "?" match correctly.
function buildPatternPiece(phrase){
  const startsWord = /^[A-Za-z0-9_]/.test(phrase);
  const endsWord = /[A-Za-z0-9_]$/.test(phrase);
  let p = escapeRegex(phrase);
  if (startsWord) p = "\\b" + p;
  if (endsWord) p = p + "\\b";
  return p;
}

const translatePattern = new RegExp(phrases.map(buildPatternPiece).join("|"), "g");

function translateText(str){
  return str.replace(translatePattern, (match)=> sinhalaDictionary[match] || match);
}

function walkAndTranslate(root, seen){
  // Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    if (seen.has(node)) continue;
    const original = node.nodeValue;
    if (!original || !original.trim()) { seen.add(node); continue; }
    const translated = translateText(original);
    if (translated !== original) node.nodeValue = translated;
    seen.add(node);
  }
  // Placeholder / title / aria-label attributes
  const elements = root.querySelectorAll("[placeholder], [title], [aria-label]");
  elements.forEach(el=>{
    ["placeholder","title","aria-label"].forEach(attr=>{
      const val = el.getAttribute(attr);
      if (val) {
        const translated = translateText(val);
        if (translated !== val) el.setAttribute(attr, translated);
      }
    });
  });
}

export function useAutoTranslate(language, containerRef){
  const seenRef = useRef(new WeakSet());

  useEffect(()=>{
    if (language !== "Sinhala") return;
    const root = containerRef.current;
    if (!root) return;

    // Reset "seen" tracking whenever this effect (re)starts, so a fresh
    // language switch re-scans everything from scratch.
    seenRef.current = new WeakSet();
    walkAndTranslate(root, seenRef.current);

    // Keep translating as React re-renders / updates the DOM.
    const observer = new MutationObserver(()=>{
      walkAndTranslate(root, seenRef.current);
    });
    observer.observe(root, { childList:true, subtree:true, characterData:true });

    return ()=> observer.disconnect();
  }, [language, containerRef]);
}
