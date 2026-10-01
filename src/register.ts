import type { App, Component } from 'vue';
import * as components from '@/components';

type VueFormsComponents = typeof components;

declare module 'vue' {
  interface GlobalComponents extends VueFormsComponents {}
}

export function registerComponents(app: App) {
  for (const [name, component] of Object.entries<Component>(components)) {
    app.component(name, component);
  }
}
