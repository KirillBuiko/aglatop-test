export function promiseWait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}