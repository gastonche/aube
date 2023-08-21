export const CONTROLLER_DEFINITIONS = Symbol("Controllers");
export const ROUTE_DEFINITIONS = Symbol("routes");

export const INJECTABLE_DEFINITIONS = Symbol("Injectable");

export const getControllerMethodParamInjectorName = (propertyKey: string) => `getters:${propertyKey}`;
