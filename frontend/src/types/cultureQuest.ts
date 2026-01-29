// Culture Quest Types

export type ScenarioType = 'scenario' | 'emotion' | 'value_tradeoff' | 'reflection';

export interface CultureDimension {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  weight: number;
}

export interface ScenarioOption {
  id: number;
  text: string;
  label?: string;
  emoji?: string;
  order: number;
}

export interface CultureScenario {
  id: number;
  type: ScenarioType;
  title: string;
  description: string;
  context: string;
  trigger_after: string;
  options: ScenarioOption[];
}

export interface CultureResponse {
  scenarioId: number;
  optionId: number;
  contextData?: Record<string, any>;
}

export interface UserCultureScore {
  dimension_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  current_score: number;
  response_count: number;
  last_updated: string;
}

export interface RadarDataPoint {
  dimension: string;
  dimensionId: string;
  userScore: number;
  cohortAvg: number;
  responseCount: number;
  icon: string;
  color: string;
}

export interface CultureQuestReward {
  message: string;
  xpEarned: number;
  dimensionUpdated: string;
}
