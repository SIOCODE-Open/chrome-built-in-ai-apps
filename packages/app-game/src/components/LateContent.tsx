import { useEffect, useState } from "react";

export function LateContent(
    props: {
        value: () => Promise<any>;
        children?: any;
    }
) {

    const [resolvedValue, setResolvedValue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(
        () => {
            const fn = async () => {
                try {
                    const value = await props.value();
                    setResolvedValue(value);
                } catch (e) {
                    setError(e);
                } finally {
                    setIsLoading(false);
                }
            };
            fn();
        },
        []
    );

    if (isLoading) {
        return <>
            <span className="text-xs text-gray-500 italic">Loading ...</span>
            {props.children}
        </>;
    } else {
        if (error) {
            return <>
                <span className="text-xs text-red-500 italic">Error: {error.message}</span>
                {props.children}
            </>;
        } else {
            return <>
                {resolvedValue}
            </>;
        }

    }
}