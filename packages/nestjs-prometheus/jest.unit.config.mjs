import { unitJestConfig } from '../../config/jest-presets.mjs';

export default {
  ...unitJestConfig,
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
