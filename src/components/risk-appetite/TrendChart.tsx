
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trendDataService, type TrendData } from '@/services/risk-appetite';
import { getRiskCategories } from '@/services/risk-management-service';
import { RiskCategory } from '@/pages/risk-management/types';

const TrendChart: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<number>(90);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeframe]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await trendDataService.getTrendData(timeframe);
      setTrendData(data);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getRiskCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredData = selectedCategory === 'all' 
    ? trendData 
    : trendData.filter(d => d.category === selectedCategory);

  // Group data by date for combined chart
  const chartData = filteredData.reduce((acc, curr) => {
    const existingEntry = acc.find(item => item.date === curr.date);
    if (existingEntry) {
      existingEntry[`${curr.category}_appetite`] = curr.appetite_value;
      existingEntry[`${curr.category}_actual`] = curr.actual_value;
      existingEntry[`${curr.category}_variance`] = curr.variance_percentage;
    } else {
      acc.push({
        date: curr.date,
        [`${curr.category}_appetite`]: curr.appetite_value,
        [`${curr.category}_actual`]: curr.actual_value,
        [`${curr.category}_variance`]: curr.variance_percentage
      });
    }
    return acc;
  }, [] as any[]);

  const uniqueCategories = [...new Set(filteredData.map(d => d.category))];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Appetite vs Actual Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Appetite vs Actual Trend</CardTitle>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe.toString()} onValueChange={(value) => setTimeframe(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trend data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name.includes('appetite') ? 'Appetite' : 
                  name.includes('actual') ? 'Actual' : 'Variance %'
                ]}
              />
              <Legend />
              
              {uniqueCategories.map((category, index) => (
                <React.Fragment key={category}>
                  <Line
                    type="monotone"
                    dataKey={`${category}_appetite`}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeDasharray="5 5"
                    name={`${category} Appetite`}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${category}_actual`}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    name={`${category} Actual`}
                  />
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;
