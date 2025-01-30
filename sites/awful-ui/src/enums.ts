export enum TabValues {
  EDIT = 'edit',
  WORKFLOWS = 'workflows',
}

export const Tabs = [
  { label: 'Edit', value: TabValues.EDIT },
  { label: 'Workflows', value: TabValues.WORKFLOWS },
] as const;
