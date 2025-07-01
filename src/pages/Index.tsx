
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-center mb-4">
              Welcome to ResilientFI
            </h1>
            <p className="text-lg text-gray-600 text-center">
              Enterprise Risk Management and Compliance Platform
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
