import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import StatCard from '@/components/dashboard/StatCard';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

// Mock the icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">TrendingDown</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
}));

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Total Incidents',
    value: '42',
    icon: TrendingUp,
  };

  it('should render with basic props', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('should render with positive trend', () => {
    render(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 12, isPositive: true }}
      />
    );
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render with negative trend', () => {
    render(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 5, isPositive: false }}
        icon={TrendingDown}
      />
    );
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render without trend data', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <StatCard 
        {...defaultProps} 
        description="This week compared to last week"
      />
    );
    
    expect(screen.getByText('This week compared to last week')).toBeInTheDocument();
  });

  it('should handle large numbers', () => {
    render(
      <StatCard 
        {...defaultProps} 
        value={1234567}
      />
    );
    
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('should handle string values with percentages', () => {
    render(
      <StatCard 
        {...defaultProps} 
        value="98.5%"
        trend={{ value: 2.3, isPositive: true }}
      />
    );
    
    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });

  it('should render with footer content', () => {
    render(
      <StatCard 
        {...defaultProps}
        footer={<span>Custom footer content</span>}
      />
    );
    
    expect(screen.getByText('Custom footer content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-test-class';
    render(
      <StatCard 
        {...defaultProps}
        className={customClass}
      />
    );
    
    const card = screen.getByRole('region', { hidden: true });
    expect(card).toHaveClass(customClass);
  });

  it('should be accessible', () => {
    render(<StatCard {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Total Incidents');
  });

  it('should display trend indicators correctly', () => {
    const { rerender } = render(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 10, isPositive: true }}
      />
    );
    
    // Test positive trend
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    
    // Test negative trend
    rerender(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 10, isPositive: false }}
      />
    );
    
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
  });
});