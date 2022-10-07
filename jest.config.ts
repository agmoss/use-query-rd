
import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        "^.+\\.(t|j)s?$": "ts-jest",
    },
    testRegex: "(/__specs__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    preset: "ts-jest",
    roots: [
        "<rootDir>/__specs__"
    ],
};
export default config;