export const CONTROLLER_DEFINITIONS = Symbol("Controllers");
export const ROUTE_DEFINITIONS = Symbol("routes");

export const INJECTABLE_DEFINITIONS = Symbol("Injectable");

export const getControllerMethodParamInjectorName = (propertyKey: string) =>
  `getters:${propertyKey}`;

export const INCLUDED_MIDDLEWARE_DEFINITIONS = Symbol("Included Middleware");
export const EXCLUDED_MIDDLEWARE_DEFINITIONS = Symbol("Excluded Middleware");
