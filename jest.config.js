const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@pages/(.*)$': '<rootDir>/pageFactory/pageRepository/$1',
    '^@objects/(.*)$': '<rootDir>/pageFactory/objectRepository/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^testConfig$': '<rootDir>/testConfig.ts',
  },
};