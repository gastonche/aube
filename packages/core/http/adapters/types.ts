import { Request, Response } from "express";
import { Constructable, RouteOptions } from "../types";

export interface ControllerMethod extends RouteOptions {
  propertyKey: string;
  handler: (req: Request, res: Response) => void;
}

export interface HttpController {
    constructor: Constructable,
    methods: ControllerMethod[],
    prefixes: string[]
}
