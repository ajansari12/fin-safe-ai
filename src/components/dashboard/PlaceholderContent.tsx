
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderContentProps {
  title: string;
  description: string;
}

export default function PlaceholderContent({ title, description }: PlaceholderContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{title} content will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
