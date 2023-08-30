import { Container as ServiceContainer, Inject, Service } from "typedi";
import { Constructable } from "./http/types";

const mappings: WeakMap<Constructable, Constructable> = new WeakMap();

export const Singleton = Service;
export { Inject };
export const Container = {
  get<T extends Constructable>(target: T): InstanceType<T> {
    return ServiceContainer.get(mappings.get(target) ?? target);
  },
  set: ServiceContainer.set.bind(ServiceContainer),
  register<P extends Constructable, C extends P>(key: P, value: C) {
    mappings.set(key, value);
  },
};
