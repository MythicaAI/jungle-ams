export enum TabValues {
  EDIT = 'edit',
  WORKFLOWS = 'workflows',
  API_KEY = 'apiKey',
}

export const Tabs = [
  { label: 'Edit', value: TabValues.EDIT },
  { label: 'Workflows', value: TabValues.WORKFLOWS },
  { label: 'API Key', value: TabValues.API_KEY },
] as const;
