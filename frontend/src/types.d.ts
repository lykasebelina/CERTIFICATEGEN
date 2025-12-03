// tells TypeScript that this module exists
declare module "../firebase" {
  export const db: any;
  export const auth: any;
  export const storage: any;
}
