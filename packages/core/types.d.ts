declare module '@gettie/core' {
    export type Branch = string[];

    export type Coverage<T> = {
        branches: {
            all: Branch[],
            used: Branch[],
            unused: Branch[],
        },
        data: {
            all: T,
            used: Partial<T>,
            unused: Partial<T>,
        }
    };

    export class Gettie<T> {
        static ignoreSymbol: Symbol;

        constructor(data?: T);

        wrapFn<TFn extends (...args: any) => T, TArgs>(fn: TFn, lock: boolean): TFn

        update(data: T, reset: boolean): T

        get(): T | null;

        unwrap(): T | null

        reset(data?: T): void

        lock(): void;

        unlock(): void

        locked(): boolean

        coverage(): Coverage<T>
    }
}
