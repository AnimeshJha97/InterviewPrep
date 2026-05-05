import { javascriptGroup } from "./javascript";
import { typescriptGroup } from "./typescript";
import { reactGroup } from "./react";
import { nodejsGroup } from "./nodejs";
import { databasesGroup } from "./databases";
import { systemDesignGroup } from "./systemdesign";
import { dsaGroup } from "./dsa";
import { leadershipGroup } from "./leadership";
import { behavioralGroup } from "./behavioral";
import { nextJsGroup } from "./nextjs";
import { reactNativeGroup } from "./reactnative";

export const prepData = {
  groups: [
    javascriptGroup,
    typescriptGroup,
    reactGroup,
    nodejsGroup,
    databasesGroup,
    systemDesignGroup,
    dsaGroup,
    leadershipGroup,
    behavioralGroup,
    nextJsGroup,
    reactNativeGroup
  ]
} as const;
