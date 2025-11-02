export function debounce<T extends Function>(func: T, ms: number) {
    let h = 0;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = window.setTimeout(() => func(...args), ms);
    };
    return <T>(<any>callable);
}
