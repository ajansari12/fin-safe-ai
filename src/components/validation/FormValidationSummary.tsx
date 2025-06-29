
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValidationResult } from '@/services/validation/data-validation-service';
import ValidationMessage from './ValidationMessage';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface FormValidationSummaryProps {
  validationResult: ValidationResult;
  showSuccessMessage?: boolean;
  className?: string;
}

const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({
  validationResult,
  showSuccessMessage = false,
  className = ''
}) => {
  const { isValid, errors, warnings } = validationResult;

  if (isValid && !showSuccessMessage) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isValid ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              Form Validation Passed
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              Form Validation Issues
            </>
          )}
          <div className="flex gap-2 ml-auto">
            {errors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errors.length} Error{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isValid && showSuccessMessage && (
          <ValidationMessage
            type="success"
            message="All validation checks passed successfully."
          />
        )}
        
        {errors.map((error, index) => (
          <ValidationMessage
            key={`error-${index}`}
            type="error"
            message={`${error.field}: ${error.message}`}
          />
        ))}
        
        {warnings.map((warning, index) => (
          <ValidationMessage
            key={`warning-${index}`}
            type="warning"
            message={`${warning.field}: ${warning.message}`}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default FormValidationSummary;
