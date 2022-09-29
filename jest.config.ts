
import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        "^.+\\.(t|j)s?$": "ts-jest",
    },
    testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    preset: "ts-jest",
};
export default config;