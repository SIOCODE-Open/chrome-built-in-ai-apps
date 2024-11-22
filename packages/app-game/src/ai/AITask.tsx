export interface IAITask<TInput, TResult> {
    name: string;
    prompt(input: TInput): Promise<TResult>;
    getPromptFor(input: TInput): { messages: Array<{ role: "system" | "user" | "assistant", content: string }>, nextMessage: string };
}
