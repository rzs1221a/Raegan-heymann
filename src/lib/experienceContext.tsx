import { createContext, useContext } from "react";
import {
  getExperienceConfig,
  type ExperienceConfig,
} from "./experienceProfile";

export const ExperienceContext = createContext<ExperienceConfig | null>(null);

export function useExperienceConfig() {
  return useContext(ExperienceContext) ?? getExperienceConfig();
}
