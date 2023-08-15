export const FORM_FILED_ERROR_MSG: { [key: string]: (param?: any) => string | { id: string; replacements: any } } = {
  required: (): string => 'Required field',
  minlength: (requiredLength: string): { id: string; replacements: any } => ({
    id: 'Must be bigger or equal than {requiredLength} char',
    replacements: {'{requiredLength}': requiredLength}
  }),
  maxlength: (requiredLength: string): { id: string; replacements: any } => ({
    id: 'Must be less or equal than {requiredLength} char',
    replacements: {'{requiredLength}': requiredLength}
  }),
  invalidValue: (): string => 'Invalid value',
  pattern: (): string => 'Invalid pattern',
};
