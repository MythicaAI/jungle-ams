export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.svg$": "jest-transformer-svg",
    "@components/(.*)": "<rootDir>/src/components/$1",
    "@services/(.*)": "<rootDir>/src/services/$1",
    "@store/(.*)": "<rootDir>/src/stores/$1",
    "types/(.*)": "<rootDir>/src/types/$1",
    "@queries/(.*)": "<rootDir>/src/queries/$1",
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
