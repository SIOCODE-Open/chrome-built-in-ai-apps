import classNames from "classnames";
import { createRef, KeyboardEvent, useEffect } from "react";
import { useProject } from "../context/Project.context";

const AUTO_PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`',
};
const AUTO_INDENT = [
    '(', '{', '['
];
const INDENT = "    ";

export function ScratchPad(props: any) {

    const textareaRef = createRef<HTMLTextAreaElement>();

    const project = useProject();

    const containerDivCn = classNames(
        "flex flex-row justify-start items-start grow shrink",
        "dark:bg-neutral-700 dark:text-white bg-white text-black",
    );

    const textareaContainerCn = classNames(
        "w-full h-full overflow-hidden",
    );

    const textareaCn = classNames(
        "font-mono text-sm w-full h-full p-2",
        "dark:bg-neutral-700 dark:text-white bg-white text-black",
        "ring-none outline-none",
        "overflow-y-auto",
        "resize-none",
        "border-r border-r-1"
    );

    const onTextareaTabDown = (e: KeyboardEvent) => {
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        const value = textarea.value;

        if (start !== end) {
            // Text is selected
            // Adjust start and end to encompass full lines
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = value.indexOf('\n', end);
            const adjustedEnd = lineEnd === -1 ? value.length : lineEnd;

            const selectedText = value.substring(lineStart, adjustedEnd);
            const lines = selectedText.split('\n');

            if (!e.shiftKey) {
                // Indent each line
                for (let i = 0; i < lines.length; i++) {
                    lines[i] = INDENT + lines[i];
                }
            } else {
                // Outdent each line
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith(INDENT)) {
                        lines[i] = lines[i].substring(INDENT.length);
                    } else {
                        lines[i] = lines[i].replace(/^\s{1,4}/, '');
                    }
                }
            }

            const newText = lines.join('\n');
            textarea.value = value.substring(0, lineStart) + newText + value.substring(adjustedEnd);
            const newStart = start;
            const newEnd = lineStart + newText.length;
            textarea.selectionStart = newStart;
            textarea.selectionEnd = newEnd;
        } else {
            // No text selected
            const cursorPos = start;
            const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
            const lineEndIndex = value.indexOf('\n', cursorPos);
            const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

            const lineText = value.substring(lineStart, lineEnd);

            if (!e.shiftKey) {
                // Insert indent at cursor
                const before = value.substring(0, cursorPos);
                const after = value.substring(cursorPos);
                textarea.value = before + INDENT + after;
                textarea.selectionStart = textarea.selectionEnd = cursorPos + INDENT.length;
            } else {
                // Decrease indentation of the current line
                let newLineText: string;
                if (lineText.startsWith(INDENT)) {
                    newLineText = lineText.substring(INDENT.length);
                } else {
                    newLineText = lineText.replace(/^\s{1,4}/, '');
                }
                const diff = lineText.length - newLineText.length;
                textarea.value = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
                const newCursorPos = cursorPos - diff;
                textarea.selectionStart = textarea.selectionEnd = newCursorPos;
            }
        }
    };



    const onTextareaAutoPairDown = (e: KeyboardEvent) => {
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const value = textarea.value;
        const before = value.substring(0, start);
        const after = value.substring(start);
        const pair = AUTO_PAIRS[e.key];
        textarea.value = before + e.key + pair + after;
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    };

    const onTextareaEnterDown = (e: KeyboardEvent) => {
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const value = textarea.value;
        const before = value.substring(0, start);
        const after = value.substring(start);
        const lines = before.split("\n");
        const currentLine = lines[lines.length - 1];
        const indentMatch = currentLine.match(/^\s*/);
        const currentIndent = indentMatch ? indentMatch[0] : '';
        let newIndent = currentIndent;

        const trimmedLine = currentLine.trim();
        const lastChar = trimmedLine.charAt(trimmedLine.length - 1);
        const nextChar = after.charAt(0);

        if (AUTO_INDENT.includes(lastChar)) {
            newIndent += INDENT;
        }

        const pair = AUTO_PAIRS[lastChar];
        if (pair && nextChar === pair) {
            // Cursor is between a pair of matching characters
            textarea.value = before + "\n" + newIndent + "\n" + currentIndent + after;
            textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
        } else {
            // Normal Enter key behavior
            textarea.value = before + "\n" + newIndent + after;
            textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
        }
    };


    const onTextareaKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            onTextareaTabDown(e);
        } else if (e.key in AUTO_PAIRS) {
            onTextareaAutoPairDown(e);
        } else if (e.key === 'Enter') {
            onTextareaEnterDown(e);
        }
    };


    const onTextareaChange = (e: any) => {
        const textarea = e.target as HTMLTextAreaElement;
        const value = textarea.value;
        project.publishScratchPadContent(value);

        // Save to local storage
        localStorage.setItem('scratchpad.content', value);
    };

    const initialContent = localStorage.getItem('scratchpad.content') || '';

    useEffect(
        () => {
            const sub = project.scratchPadContentPushed.subscribe(
                (content) => {
                    textareaRef.current!.value = content;
                }
            );
            return () => {
                sub.unsubscribe();
            };
        },
        []
    );

    return <>
        <div className={containerDivCn}>
            <div className={textareaContainerCn}>
                <textarea className={textareaCn}
                    onKeyDown={onTextareaKeyDown}
                    placeholder="Scratchy notes ..."
                    onChange={onTextareaChange}
                    defaultValue={initialContent}
                    ref={textareaRef}
                />
            </div>
        </div>
    </>;
}