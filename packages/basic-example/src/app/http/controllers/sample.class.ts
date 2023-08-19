import { Service } from "@aube/core";

@Service()
export default class SampleClass {
    constructor() {
        console.log(this);
    }
}