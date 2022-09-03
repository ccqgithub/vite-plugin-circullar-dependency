import { Plugin } from 'vite';
export declare const circularDependencyPlugin: (options?: {
    exclude?: RegExp;
    include?: RegExp;
    failOnError?: boolean;
    allowAsyncCycles?: boolean;
    cwd?: string;
}) => Plugin;
export default circularDependencyPlugin;
