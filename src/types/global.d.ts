type VueFormsComponents = typeof import('../components');

declare module 'vue' {
  interface GlobalComponents extends VueFormsComponents {}
}

export {};
