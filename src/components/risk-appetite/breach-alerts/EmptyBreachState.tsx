
import React from "react";
import { CheckCircle } from "lucide-react";

const EmptyBreachState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <p className="text-muted-foreground">No appetite breaches detected</p>
    </div>
  );
};

export default EmptyBreachState;
