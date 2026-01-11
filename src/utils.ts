export function debounce<T extends Function>(func: T, ms: number) {
    let h = 0;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = window.setTimeout(() => func(...args), ms);
    };
    return <T>(<any>callable);
}

export function project(source: Record<string, unknown>, keys: string[]) {
    const result: Record<string, unknown> = {};
    for (const key of keys) {
        result[key] = source[key];
    }
    return result;
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
