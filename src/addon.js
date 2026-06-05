import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, historyKeymap, history } from '@codemirror/commands';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { html } from '@codemirror/lang-html';
import { css, cssCompletionSource } from '@codemirror/lang-css';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

(function () {
    'use strict';

    function buildVscTheme(isDark) {
        const dark = EditorView.theme({
            '&': { backgroundColor: '#1e1e1e', color: '#d4d4d4', borderRadius: '6px', overflow: 'hidden' },
            '.cm-content': { caretColor: '#aeafad', padding: '12px 0', fontFamily: '"Cascadia Code","Fira Code","Consolas","Courier New",monospace', fontSize: '13px', lineHeight: '1.6' },
            '.cm-cursor': { borderLeftColor: '#aeafad' },
            '.cm-activeLine': { backgroundColor: '#ffffff0d' },
            '.cm-activeLineGutter': { backgroundColor: '#ffffff0d' },
            '.cm-gutters': { backgroundColor: '#1e1e1e', color: '#858585', border: 'none', borderRight: '1px solid #3c3c3c' },
            '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '8px', paddingRight: '12px' },
            '.cm-scroller': { overflow: 'auto', minHeight: '200px', maxHeight: '600px' },
            '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: '#264f78 !important' },
            '.cm-tooltip': { backgroundColor: '#252526', border: '1px solid #454545', borderRadius: '4px' },
            '.cm-tooltip-autocomplete ul li': { padding: '2px 8px', color: '#d4d4d4' },
            '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#094771', color: '#ffffff' },
            '.cm-completionIcon': { opacity: '0.7' },
        }, { dark: true });

        const darkHighlight = syntaxHighlighting(HighlightStyle.define([
            { tag: tags.keyword,        color: '#569cd6' },
            { tag: tags.string,         color: '#ce9178' },
            { tag: tags.comment,        color: '#6a9955', fontStyle: 'italic' },
            { tag: tags.number,         color: '#b5cea8' },
            { tag: tags.className,      color: '#d7ba7d' },
            { tag: tags.tagName,        color: '#4ec9b0' },
            { tag: tags.propertyName,   color: '#9cdcfe' },
            { tag: tags.variableName,   color: '#9cdcfe' },
            { tag: tags.attributeName,  color: '#9cdcfe' },
            { tag: tags.attributeValue, color: '#ce9178' },
            { tag: tags.angleBracket,   color: '#808080' },
            { tag: tags.unit,           color: '#b5cea8' },
            { tag: tags.color,          color: '#ce9178' },
            { tag: tags.bracket,        color: '#ffd700' },
            { tag: tags.punctuation,    color: '#d4d4d4' },
            { tag: tags.operator,       color: '#d4d4d4' },
        ]));

        const light = EditorView.theme({
            '&': { backgroundColor: '#ffffff', color: '#000000', borderRadius: '6px', overflow: 'hidden' },
            '.cm-content': { caretColor: '#000000', padding: '12px 0', fontFamily: '"Cascadia Code","Fira Code","Consolas","Courier New",monospace', fontSize: '13px', lineHeight: '1.6' },
            '.cm-activeLine': { backgroundColor: '#0000000d' },
            '.cm-activeLineGutter': { backgroundColor: '#0000000d' },
            '.cm-gutters': { backgroundColor: '#f3f3f3', color: '#237893', border: 'none', borderRight: '1px solid #e8e8e8' },
            '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '8px', paddingRight: '12px' },
            '.cm-scroller': { overflow: 'auto', minHeight: '200px', maxHeight: '600px' },
            '.cm-tooltip': { backgroundColor: '#f3f3f3', border: '1px solid #c8c8c8', borderRadius: '4px' },
            '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#0060c0', color: '#ffffff' },
        });

        const lightHighlight = syntaxHighlighting(HighlightStyle.define([
            { tag: tags.keyword,        color: '#0000ff' },
            { tag: tags.string,         color: '#a31515' },
            { tag: tags.comment,        color: '#008000', fontStyle: 'italic' },
            { tag: tags.number,         color: '#098658' },
            { tag: tags.tagName,        color: '#800000' },
            { tag: tags.attributeName,  color: '#ff0000' },
            { tag: tags.attributeValue, color: '#0000ff' },
            { tag: tags.propertyName,   color: '#001080' },
            { tag: tags.angleBracket,   color: '#800000' },
            { tag: tags.className,      color: '#267f99' },
            { tag: tags.unit,           color: '#098658' },
            { tag: tags.punctuation,    color: '#000000' },
        ]));

        return isDark ? [dark, darkHighlight] : [light, lightHighlight];
    }

    function detectDarkMode() {
        return document.documentElement.classList.contains('dark')
            || document.body.classList.contains('dark');
    }

    Statamic.booting(() => {

        Statamic.$components.register('code-editor-fieldtype', {
            props: {
                value:  { type: String, default: '' },
                meta:   { type: Object, default: () => ({}) },
                config: { type: Object, default: () => ({}) },
            },
            emits: ['update:value', 'focus', 'blur'],
            setup(props, { emit }) {
                const { ref, onMounted, onBeforeUnmount, watch } = window.Vue;
                const container = ref(null);
                let view = null;

                onMounted(() => {
                    const lang = props.config?.language || 'html';
                    const theme = buildVscTheme(detectDarkMode());
                    const langExtension = lang === 'css'
                        ? css()
                        : html({ autoCloseTags: true });

                    const updateListener = EditorView.updateListener.of((update) => {
                        if (update.docChanged) emit('update:value', update.state.doc.toString());
                    });

                    view = new EditorView({
                        state: EditorState.create({
                            doc: props.value || '',
                            extensions: [
                                lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(),
                                history(), langExtension, closeBrackets(), autocompletion(),
                                keymap.of([...defaultKeymap, indentWithTab, ...historyKeymap, ...completionKeymap, ...closeBracketsKeymap]),
                                updateListener, EditorView.lineWrapping, ...theme,
                            ],
                        }),
                        parent: container.value,
                    });
                });

                watch(() => props.value, (newVal) => {
                    if (!view) return;
                    const current = view.state.doc.toString();
                    if (current !== newVal) view.dispatch({ changes: { from: 0, to: current.length, insert: newVal || '' } });
                });

                onBeforeUnmount(() => { if (view) view.destroy(); });

                return () => window.Vue.h('div', { ref: container, class: 'code-editor-wrap' });
            },
        });

        Statamic.$components.register('css-editor-fieldtype', {
            props: {
                value:  { type: String, default: '' },
                meta:   { type: Object, default: () => ({}) },
                config: { type: Object, default: () => ({}) },
            },
            emits: ['update:value', 'focus', 'blur'],
            setup(props, { emit }) {
                const { ref, onMounted, onBeforeUnmount, watch } = window.Vue;
                const container = ref(null);
                let view = null;

                onMounted(() => {
                    const theme = buildVscTheme(detectDarkMode());
                    const updateListener = EditorView.updateListener.of((update) => {
                        if (update.docChanged) emit('update:value', update.state.doc.toString());
                    });

                    view = new EditorView({
                        state: EditorState.create({
                            doc: props.value || '',
                            extensions: [
                                lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(),
                                history(), css(), closeBrackets(),
                                autocompletion({ override: [cssCompletionSource] }),
                                keymap.of([...defaultKeymap, indentWithTab, ...historyKeymap, ...completionKeymap, ...closeBracketsKeymap]),
                                updateListener, EditorView.lineWrapping, ...theme,
                            ],
                        }),
                        parent: container.value,
                    });
                });

                watch(() => props.value, (newVal) => {
                    if (!view) return;
                    const current = view.state.doc.toString();
                    if (current !== newVal) view.dispatch({ changes: { from: 0, to: current.length, insert: newVal || '' } });
                });

                onBeforeUnmount(() => { if (view) view.destroy(); });

                return () => window.Vue.h('div', { ref: container, class: 'code-editor-wrap' });
            },
        });

    });
}());
