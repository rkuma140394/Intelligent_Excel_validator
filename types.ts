
export interface ValidationRule {
  column: string;
  ruleDescription: string;
  type: 'regex' | 'range' | 'notEmpty' | 'custom';
  params?: {
    pattern?: string;
    flags?: string;
    min?: number;
    max?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RowData {
  [key: string]: any;
}

export interface ProcessingState {
  status: 'idle' | 'parsing-rules' | 'validating' | 'completed' | 'error';
  message: string;
}

export interface AppResults {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  invalidData: any[];
  fileName: string;
  interpretedRules: ValidationRule[];
}
