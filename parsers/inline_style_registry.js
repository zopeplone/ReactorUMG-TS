"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePseudo = normalizePseudo;
exports.clearInlineStylesForSource = clearInlineStylesForSource;
exports.registerInlineStyles = registerInlineStyles;
exports.getInlineStyles = getInlineStyles;
exports.parseInlineCss = parseInlineCss;
exports.clearAllInlineStyles = clearAllInlineStyles;
const inlineStyleBuckets = new Map();
const sourceEntries = new Map();
function buildBucketKey(kind, key, pseudo) {
    return `${kind}:${key}|${pseudo}`;
}
function normalizePseudo(pseudo) {
    if (!pseudo || pseudo === 'base') {
        return 'base';
    }
    const trimmed = pseudo.trim();
    if (!trimmed) {
        return 'base';
    }
    return trimmed.startsWith(':') ? trimmed : `:${trimmed}`;
}
function clearInlineStylesForSource(sourceId) {
    const entries = sourceEntries.get(sourceId);
    if (!entries || entries.length === 0) {
        sourceEntries.delete(sourceId);
        return;
    }
    for (const { bucketKey, styles } of entries) {
        const bucket = inlineStyleBuckets.get(bucketKey);
        if (!bucket)
            continue;
        const nextBucket = bucket.filter(entry => entry.sourceId !== sourceId || entry.styles !== styles);
        if (nextBucket.length === 0) {
            inlineStyleBuckets.delete(bucketKey);
        }
        else {
            inlineStyleBuckets.set(bucketKey, nextBucket);
        }
    }
    sourceEntries.delete(sourceId);
}
function registerInlineStyles(sourceId, rules) {
    clearInlineStylesForSource(sourceId);
    if (!rules || rules.length === 0) {
        return;
    }
    const recorded = [];
    for (const rule of rules) {
        if (!rule.key || !rule.styles)
            continue;
        const pseudo = normalizePseudo(rule.pseudo);
        const bucketKey = buildBucketKey(rule.kind, rule.key, pseudo);
        let bucket = inlineStyleBuckets.get(bucketKey);
        if (!bucket) {
            bucket = [];
            inlineStyleBuckets.set(bucketKey, bucket);
        }
        const stylesCopy = { ...rule.styles };
        bucket.push({ sourceId, styles: stylesCopy });
        recorded.push({ bucketKey, styles: stylesCopy });
    }
    if (recorded.length > 0) {
        sourceEntries.set(sourceId, recorded);
    }
}
function getInlineStyles(kind, key, pseudo) {
    if (!key) {
        return undefined;
    }
    const normalizedPseudo = normalizePseudo(pseudo);
    const bucketKey = buildBucketKey(kind, key, normalizedPseudo);
    let bucket = inlineStyleBuckets.get(bucketKey);
    if (!bucket && normalizedPseudo.startsWith(':')) {
        const fallbackKey = buildBucketKey(kind, key, normalizedPseudo.slice(1));
        bucket = inlineStyleBuckets.get(fallbackKey);
    }
    if (!bucket || bucket.length === 0) {
        return undefined;
    }
    const result = {};
    for (const entry of bucket) {
        Object.assign(result, entry.styles);
    }
    return result;
}
function parseInlineCss(cssText, declarationParser) {
    if (!cssText || typeof cssText !== 'string') {
        return [];
    }
    const sanitized = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    const regex = /([^{}]+)\{([^{}]*)\}/g;
    const rules = [];
    let match;
    while ((match = regex.exec(sanitized)) !== null) {
        const selectorGroup = match[1].trim();
        const declarationBlock = match[2].trim();
        if (!selectorGroup || !declarationBlock)
            continue;
        const declarationMap = declarationParser(declarationBlock);
        if (!declarationMap || Object.keys(declarationMap).length === 0)
            continue;
        const selectors = selectorGroup.split(',').map(sel => sel.trim()).filter(Boolean);
        for (const selector of selectors) {
            if (!selector)
                continue;
            const { kind, key, pseudo } = dissectSelector(selector);
            if (!key)
                continue;
            rules.push({
                kind,
                key,
                pseudo,
                styles: { ...declarationMap }
            });
        }
    }
    return rules;
}
function dissectSelector(selector) {
    let base = selector;
    let pseudo = 'base';
    const separatorIndex = findPseudoSeparator(selector);
    if (separatorIndex >= 0) {
        base = selector.slice(0, separatorIndex).trim();
        pseudo = selector.slice(separatorIndex).trim() || 'base';
    }
    else {
        base = selector.trim();
    }
    if (!base) {
        return { kind: 'type', key: '', pseudo };
    }
    if (base.startsWith('.')) {
        return { kind: 'class', key: base.slice(1).trim(), pseudo };
    }
    if (base.startsWith('#')) {
        return { kind: 'id', key: base.slice(1).trim(), pseudo };
    }
    return { kind: 'type', key: base.toLowerCase(), pseudo };
}
function findPseudoSeparator(selector) {
    let paren = 0;
    let bracket = 0;
    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i];
        if (ch === '(') {
            paren++;
        }
        else if (ch === ')') {
            paren = Math.max(0, paren - 1);
        }
        else if (ch === '[') {
            bracket++;
        }
        else if (ch === ']') {
            bracket = Math.max(0, bracket - 1);
        }
        else if (ch === ':' && paren === 0 && bracket === 0) {
            return i;
        }
    }
    return -1;
}
function clearAllInlineStyles() {
    inlineStyleBuckets.clear();
    sourceEntries.clear();
}
//# sourceMappingURL=inline_style_registry.js.map