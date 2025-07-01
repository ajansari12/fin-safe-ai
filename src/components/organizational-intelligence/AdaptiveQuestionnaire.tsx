
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Save, 
  CheckCircle2,
  AlertCircle,
  Brain
} from 'lucide-react';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import { toast } from 'sonner';
import type { 
  QuestionnaireTemplate, 
  QuestionnaireResponse, 
  QuestionnaireSection, 
  QuestionnaireQuestion 
} from '@/types/organizational-intelligence';

interface AdaptiveQuestionnaireProps {
  templateId: string;
  onComplete?: (responses: Record<string, any>) => void;
  onSave?: (responses: Record<string, any>) => void;
}

const AdaptiveQuestionnaire: React.FC<AdaptiveQuestionnaireProps> = ({
  templateId,
  onComplete,
  onSave
}) => {
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleSections, setVisibleSections] = useState<QuestionnaireSection[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuestionnaire();
  }, [templateId]);

  useEffect(() => {
    if (template) {
      updateVisibleSections();
      calculateCompletionPercentage();
    }
  }, [template, responses]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      
      // Load template
      const templates = await organizationalIntelligenceService.getQuestionnaireTemplates();
      const currentTemplate = templates.find(t => t.id === templateId);
      
      if (!currentTemplate) {
        toast.error('Questionnaire template not found');
        return;
      }
      
      setTemplate(currentTemplate);

      // Load existing responses
      const existingResponse = await organizationalIntelligenceService.getQuestionnaireResponse(templateId);
      if (existingResponse) {
        setResponses(existingResponse.responses);
        if (existingResponse.current_section) {
          const sectionIndex = currentTemplate.questions.findIndex(s => s.id === existingResponse.current_section);
          if (sectionIndex >= 0) {
            setCurrentSectionIndex(sectionIndex);
          }
        }
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      toast.error('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const updateVisibleSections = () => {
    if (!template) return;

    const visible = template.questions.filter(section => {
      if (!section.conditional) return true;
      
      const dependentValue = responses[section.conditional.dependsOn];
      return evaluateCondition(dependentValue, section.conditional.condition, section.conditional.value);
    });

    setVisibleSections(visible);
  };

  const evaluateCondition = (value: any, condition: string, expectedValue: any): boolean => {
    switch (condition) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return Array.isArray(value) && value.includes(expectedValue);
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      case 'exists':
        return value !== undefined && value !== null && value !== '';
      default:
        return true;
    }
  };

  const calculateCompletionPercentage = () => {
    if (!template) return;

    const allQuestions = visibleSections.flatMap(section => 
      section.questions.filter(q => !q.conditional || isQuestionVisible(q))
    );
    
    const requiredQuestions = allQuestions.filter(q => q.required);
    
    if (requiredQuestions.length === 0) {
      setCompletionPercentage(100);
      return;
    }

    const answeredRequired = requiredQuestions.filter(q => 
      responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== ''
    ).length;

    setCompletionPercentage(Math.round((answeredRequired / requiredQuestions.length) * 100));
  };

  const isQuestionVisible = (question: QuestionnaireQuestion): boolean => {
    if (!question.conditional) return true;
    
    const dependentValue = responses[question.conditional.dependsOn];
    return evaluateCondition(dependentValue, question.conditional.condition, question.conditional.value);
  };

  const validateQuestion = (question: QuestionnaireQuestion, value: any): string | null => {
    if (question.required && (value === undefined || value === null || value === '')) {
      return 'This field is required';
    }

    if (question.validation) {
      const { min, max, pattern } = question.validation;
      
      if (min !== undefined && Number(value) < min) {
        return `Value must be at least ${min}`;
      }
      
      if (max !== undefined && Number(value) > max) {
        return `Value must be at most ${max}`;
      }
      
      if (pattern && !new RegExp(pattern).test(String(value))) {
        return 'Invalid format';
      }
    }

    return null;
  };

  const handleResponseChange = (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Auto-save responses
    debouncedSave(newResponses);
  };

  const debouncedSave = React.useCallback(
    debounce((responses: Record<string, any>) => {
      saveResponses(responses, false);
    }, 1000),
    [templateId]
  );

  const saveResponses = async (responsesToSave: Record<string, any>, showToast = true) => {
    try {
      setSaving(true);
      
      const currentSection = visibleSections[currentSectionIndex]?.id;
      await organizationalIntelligenceService.saveQuestionnaireResponse(
        templateId, 
        responsesToSave, 
        currentSection
      );
      
      if (showToast) {
        toast.success('Responses saved');
      }
      
      if (onSave) {
        onSave(responsesToSave);
      }
    } catch (error) {
      console.error('Error saving responses:', error);
      if (showToast) {
        toast.error('Failed to save responses');
      }
    } finally {
      setSaving(false);
    }
  };

  const validateCurrentSection = (): boolean => {
    const currentSection = visibleSections[currentSectionIndex];
    if (!currentSection) return true;

    const errors: Record<string, string> = {};
    const visibleQuestions = currentSection.questions.filter(q => isQuestionVisible(q));

    visibleQuestions.forEach(question => {
      const error = validateQuestion(question, responses[question.id]);
      if (error) {
        errors[question.id] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      toast.error('Please correct the errors before proceeding');
      return;
    }

    if (currentSectionIndex < visibleSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentSection()) {
      toast.error('Please correct all errors before completing');
      return;
    }

    await saveResponses(responses);
    
    if (onComplete) {
      onComplete(responses);
    }
    
    toast.success('Questionnaire completed successfully!');
  };

  const renderQuestion = (question: QuestionnaireQuestion) => {
    if (!isQuestionVisible(question)) return null;

    const value = responses[question.id];
    const error = validationErrors[question.id];

    return (
      <div key={question.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={question.id} className="font-medium">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.help && (
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {question.help}
              </div>
            </div>
          )}
        </div>
        
        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}

        {renderQuestionInput(question, value)}
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionInput = (question: QuestionnaireQuestion, value: any) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={validationErrors[question.id] ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            min={question.validation?.min}
            max={question.validation?.max}
            className={validationErrors[question.id] ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleResponseChange(question.id, newValue)}
          >
            <SelectTrigger className={validationErrors[question.id] ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    let newValues;
                    if (checked) {
                      newValues = [...selectedValues, option];
                    } else {
                      newValues = selectedValues.filter((v) => v !== option);
                    }
                    handleResponseChange(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>
                  {option.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.id}
              checked={value === true}
              onCheckedChange={(checked) => handleResponseChange(question.id, checked)}
            />
            <Label htmlFor={question.id}>Yes</Label>
          </div>
        );

      case 'date':
        return (
          <Input
            id={question.id}
            type="date"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={validationErrors[question.id] ? 'border-red-500' : ''}
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              id={question.id}
              min={question.validation?.min || 0}
              max={question.validation?.max || 100}
              value={value || question.validation?.min || 0}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 text-center">
              Value: {value || question.validation?.min || 0}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p>Loading intelligent questionnaire...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!template || visibleSections.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No questionnaire available</p>
        </CardContent>
      </Card>
    );
  }

  const currentSection = visibleSections[currentSectionIndex];
  const isLastSection = currentSectionIndex === visibleSections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-500" />
                {template.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{completionPercentage}% Complete</Badge>
              {saving && <Badge variant="secondary">Saving...</Badge>}
            </div>
          </div>
          <Progress value={completionPercentage} className="w-full" />
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {visibleSections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <button
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      index === currentSectionIndex 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentSectionIndex 
                        ? 'bg-green-500 text-white' 
                        : index === currentSectionIndex 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < currentSectionIndex ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm font-medium">{section.section}</span>
                  </button>
                  {index < visibleSections.length - 1 && (
                    <div className="w-8 h-px bg-gray-200" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSection.section}</CardTitle>
          {currentSection.description && (
            <p className="text-gray-600">{currentSection.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSection.questions.map(renderQuestion)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstSection}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => saveResponses(responses)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Progress
              </Button>

              {isLastSection ? (
                <Button
                  onClick={handleComplete}
                  disabled={completionPercentage < 100}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Assessment
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default AdaptiveQuestionnaire;
