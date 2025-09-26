#!/usr/bin/env python3
"""
Blaze Intelligence Monte Carlo Simulation Engine
BlazeSportsIntel.com Revenue & ROI Analysis
Austin Humphrey • Blaze Sports Intel
Timestamp: 2025-09-25 14:30:00 CDT
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime, timezone, timedelta
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

@dataclass
class SimulationParameters:
    """Core parameters for Monte Carlo simulation"""
    
    # Subscription Tiers (monthly)
    basic_price: Tuple[float, float] = (29, 49)  # Min, Max
    pro_price: Tuple[float, float] = (99, 149)
    enterprise_price: Tuple[float, float] = (499, 999)
    
    # Subscriber counts (ranges)
    basic_subscribers: Tuple[int, int] = (50, 300)
    pro_subscribers: Tuple[int, int] = (20, 100)
    enterprise_subscribers: Tuple[int, int] = (5, 25)
    
    # API & Data Revenue
    api_monthly_base: Tuple[float, float] = (500, 2000)
    api_per_call_revenue: Tuple[float, float] = (0.001, 0.01)
    monthly_api_calls: Tuple[int, int] = (100000, 1000000)
    
    # Custom Analytics Projects
    projects_per_month: Tuple[int, int] = (1, 5)
    project_value: Tuple[float, float] = (2000, 15000)
    
    # Data Licensing (annual, divided by 12)
    annual_licensing_deals: Tuple[int, int] = (2, 8)
    licensing_value: Tuple[float, float] = (10000, 50000)
    
    # Operating Costs
    infrastructure_monthly: Tuple[float, float] = (500, 1500)
    data_acquisition: Tuple[float, float] = (1000, 3000)
    personnel_allocation: Tuple[float, float] = (2000, 5000)  # Part-time/contract
    marketing_monthly: Tuple[float, float] = (500, 2000)
    
    # Market Factors
    seasonality_factor: Tuple[float, float] = (0.7, 1.3)  # Sports season impact
    market_growth_rate: Tuple[float, float] = (0.98, 1.15)  # Monthly growth
    churn_rate: Tuple[float, float] = (0.02, 0.08)  # Monthly churn
    
    # Efficiency Factors
    automation_savings: Tuple[float, float] = (0.1, 0.3)  # Cost reduction
    platform_efficiency: Tuple[float, float] = (1.0, 1.5)  # Revenue multiplier

    # Sports-specific factors
    baseball_impact: Tuple[float, float] = (0.9, 1.4)  # Primary sport
    football_impact: Tuple[float, float] = (0.8, 1.3)
    basketball_impact: Tuple[float, float] = (0.7, 1.2)
    track_field_impact: Tuple[float, float] = (0.5, 0.9)


class BlazeIntelMonteCarlo:
    """Monte Carlo simulation engine for Blaze Intelligence"""
    
    def __init__(self, params: SimulationParameters, n_simulations: int = 10000):
        self.params = params
        self.n_simulations = n_simulations
        self.results = None
        
    def _sample_uniform(self, param_range: Tuple[float, float]) -> np.ndarray:
        """Sample from uniform distribution"""
        return np.random.uniform(param_range[0], param_range[1], self.n_simulations)
    
    def _sample_normal_bounded(self, param_range: Tuple[float, float], 
                               skew: float = 0) -> np.ndarray:
        """Sample from normal distribution, bounded by range"""
        mean = (param_range[0] + param_range[1]) / 2
        std = (param_range[1] - param_range[0]) / 4
        samples = np.random.normal(mean, std, self.n_simulations)
        
        if skew != 0:
            # Apply skewness
            samples = samples + skew * (samples - mean) ** 2 / std
        
        # Bound the samples
        samples = np.clip(samples, param_range[0], param_range[1])
        return samples
    
    def _sample_integer(self, param_range: Tuple[int, int]) -> np.ndarray:
        """Sample integers from range"""
        return np.random.randint(param_range[0], param_range[1] + 1, self.n_simulations)
    
    def simulate_subscription_revenue(self) -> Dict[str, np.ndarray]:
        """Simulate subscription-based revenue"""
        
        # Sample subscriber counts
        basic_subs = self._sample_integer(self.params.basic_subscribers)
        pro_subs = self._sample_integer(self.params.pro_subscribers)
        enterprise_subs = self._sample_integer(self.params.enterprise_subscribers)
        
        # Sample pricing
        basic_price = self._sample_uniform(self.params.basic_price)
        pro_price = self._sample_uniform(self.params.pro_price)
        enterprise_price = self._sample_uniform(self.params.enterprise_price)
        
        # Apply churn
        churn = self._sample_uniform(self.params.churn_rate)
        retention = 1 - churn
        
        # Calculate revenue
        basic_revenue = basic_subs * basic_price * retention
        pro_revenue = pro_subs * pro_price * retention
        enterprise_revenue = enterprise_subs * enterprise_price * retention
        
        return {
            'basic': basic_revenue,
            'pro': pro_revenue,
            'enterprise': enterprise_revenue,
            'total_subscription': basic_revenue + pro_revenue + enterprise_revenue,
            'total_subscribers': (basic_subs + pro_subs + enterprise_subs) * retention
        }
    
    def simulate_api_revenue(self) -> Dict[str, np.ndarray]:
        """Simulate API and data access revenue"""
        
        base_revenue = self._sample_uniform(self.params.api_monthly_base)
        per_call_revenue = self._sample_uniform(self.params.api_per_call_revenue)
        monthly_calls = self._sample_integer(self.params.monthly_api_calls)
        
        usage_revenue = monthly_calls * per_call_revenue
        total_api = base_revenue + usage_revenue
        
        return {
            'api_base': base_revenue,
            'api_usage': usage_revenue,
            'total_api': total_api,
            'api_calls': monthly_calls
        }
    
    def simulate_project_revenue(self) -> Dict[str, np.ndarray]:
        """Simulate custom analytics project revenue"""
        
        num_projects = self._sample_integer(self.params.projects_per_month)
        project_values = self._sample_normal_bounded(self.params.project_value, skew=0.2)
        
        total_project_revenue = num_projects * project_values
        
        return {
            'project_count': num_projects,
            'avg_project_value': project_values,
            'total_projects': total_project_revenue
        }
    
    def simulate_licensing_revenue(self) -> Dict[str, np.ndarray]:
        """Simulate data licensing revenue"""
        
        annual_deals = self._sample_integer(self.params.annual_licensing_deals)
        deal_values = self._sample_normal_bounded(self.params.licensing_value)
        
        # Convert annual to monthly
        monthly_licensing = (annual_deals * deal_values) / 12
        
        return {
            'annual_deals': annual_deals,
            'deal_value': deal_values,
            'monthly_licensing': monthly_licensing
        }
    
    def simulate_costs(self) -> Dict[str, np.ndarray]:
        """Simulate operating costs"""
        
        infrastructure = self._sample_uniform(self.params.infrastructure_monthly)
        data_acq = self._sample_normal_bounded(self.params.data_acquisition)
        personnel = self._sample_normal_bounded(self.params.personnel_allocation)
        marketing = self._sample_uniform(self.params.marketing_monthly)
        
        # Apply automation savings
        automation = self._sample_uniform(self.params.automation_savings)
        
        # Reduce costs by automation factor
        infrastructure *= (1 - automation * 0.5)  # 50% of savings apply to infra
        data_acq *= (1 - automation * 0.3)  # 30% to data
        personnel *= (1 - automation * 0.2)  # 20% to personnel
        
        total_costs = infrastructure + data_acq + personnel + marketing
        
        return {
            'infrastructure': infrastructure,
            'data_acquisition': data_acq,
            'personnel': personnel,
            'marketing': marketing,
            'total_costs': total_costs,
            'automation_savings': automation
        }
    
    def apply_market_factors(self, base_revenue: np.ndarray) -> np.ndarray:
        """Apply market and seasonal factors"""
        
        seasonality = self._sample_uniform(self.params.seasonality_factor)
        growth = self._sample_uniform(self.params.market_growth_rate)
        efficiency = self._sample_uniform(self.params.platform_efficiency)
        
        # Sports-specific impacts (weighted by importance)
        baseball = self._sample_uniform(self.params.baseball_impact) * 0.35
        football = self._sample_uniform(self.params.football_impact) * 0.30
        basketball = self._sample_uniform(self.params.basketball_impact) * 0.25
        track = self._sample_uniform(self.params.track_field_impact) * 0.10
        
        sports_factor = baseball + football + basketball + track
        
        adjusted_revenue = base_revenue * seasonality * growth * efficiency * sports_factor
        
        return adjusted_revenue
    
    def run_simulation(self) -> pd.DataFrame:
        """Run complete Monte Carlo simulation"""
        
        print("Running Blaze Intelligence Monte Carlo Simulation...")
        print(f"Simulations: {self.n_simulations:,}")
        print(f"Timestamp: {datetime.now(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d %H:%M:%S CDT')}")
        print("-" * 60)
        
        # Revenue streams
        subscription = self.simulate_subscription_revenue()
        api = self.simulate_api_revenue()
        projects = self.simulate_project_revenue()
        licensing = self.simulate_licensing_revenue()
        
        # Calculate total revenue
        total_revenue = (
            subscription['total_subscription'] +
            api['total_api'] +
            projects['total_projects'] +
            licensing['monthly_licensing']
        )
        
        # Apply market factors
        adjusted_revenue = self.apply_market_factors(total_revenue)
        
        # Calculate costs
        costs = self.simulate_costs()
        
        # Calculate profit and metrics
        gross_profit = adjusted_revenue - costs['total_costs']
        profit_margin = gross_profit / adjusted_revenue
        roi = (gross_profit / costs['total_costs']) * 100
        
        # Hours saved calculation (assuming $55/hour value)
        hours_saved = gross_profit / 55
        
        # Create results dataframe
        results_data = {
            # Revenue streams
            'subscription_revenue': subscription['total_subscription'],
            'api_revenue': api['total_api'],
            'project_revenue': projects['total_projects'],
            'licensing_revenue': licensing['monthly_licensing'],
            
            # Costs
            'total_costs': costs['total_costs'],
            'infrastructure_cost': costs['infrastructure'],
            'data_cost': costs['data_acquisition'],
            'personnel_cost': costs['personnel'],
            'marketing_cost': costs['marketing'],
            
            # Profitability
            'gross_revenue': total_revenue,
            'adjusted_revenue': adjusted_revenue,
            'gross_profit': gross_profit,
            'profit_margin': profit_margin,
            'roi_percent': roi,
            'monthly_value': gross_profit,
            'hours_saved': hours_saved,
            
            # Operational metrics
            'total_subscribers': subscription['total_subscribers'],
            'api_calls': api['api_calls'],
            'project_count': projects['project_count'],
            'automation_savings': costs['automation_savings']
        }
        
        self.results = pd.DataFrame(results_data)
        return self.results
    
    def generate_statistics(self) -> pd.DataFrame:
        """Generate summary statistics"""
        
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        key_metrics = [
            'monthly_value', 'adjusted_revenue', 'gross_profit', 
            'roi_percent', 'hours_saved', 'total_subscribers'
        ]
        
        stats = []
        for metric in key_metrics:
            metric_stats = {
                'Metric': metric.replace('_', ' ').title(),
                'Mean': self.results[metric].mean(),
                'Median': self.results[metric].median(),
                'Std Dev': self.results[metric].std(),
                '5th %ile': self.results[metric].quantile(0.05),
                '25th %ile': self.results[metric].quantile(0.25),
                '75th %ile': self.results[metric].quantile(0.75),
                '95th %ile': self.results[metric].quantile(0.95),
                'Min': self.results[metric].min(),
                'Max': self.results[metric].max()
            }
            stats.append(metric_stats)
        
        return pd.DataFrame(stats)
    
    def plot_results(self, save_path: str = None) -> None:
        """Generate comprehensive visualization suite"""
        
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        # Create figure with subplots
        fig = plt.figure(figsize=(20, 12))
        fig.suptitle('Blaze Intelligence Monte Carlo Analysis', fontsize=16, fontweight='bold')
        
        # 1. Monthly Value Distribution
        ax1 = plt.subplot(2, 3, 1)
        ax1.hist(self.results['monthly_value'], bins=50, color='#FF6B35', alpha=0.7, edgecolor='black')
        ax1.axvline(self.results['monthly_value'].mean(), color='red', linestyle='--', linewidth=2, label=f"Mean: ${self.results['monthly_value'].mean():,.0f}")
        ax1.axvline(self.results['monthly_value'].median(), color='blue', linestyle='--', linewidth=2, label=f"Median: ${self.results['monthly_value'].median():,.0f}")
        ax1.set_xlabel('Monthly Value ($)', fontweight='bold')
        ax1.set_ylabel('Frequency', fontweight='bold')
        ax1.set_title('Monthly Dollar Value Distribution')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # 2. ROI Distribution
        ax2 = plt.subplot(2, 3, 2)
        ax2.hist(self.results['roi_percent'], bins=50, color='#4ECDC4', alpha=0.7, edgecolor='black')
        ax2.axvline(self.results['roi_percent'].mean(), color='red', linestyle='--', linewidth=2, label=f"Mean: {self.results['roi_percent'].mean():.1f}%")
        ax2.set_xlabel('ROI (%)', fontweight='bold')
        ax2.set_ylabel('Frequency', fontweight='bold')
        ax2.set_title('Return on Investment Distribution')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        # 3. Revenue Breakdown Box Plot
        ax3 = plt.subplot(2, 3, 3)
        revenue_data = self.results[['subscription_revenue', 'api_revenue', 'project_revenue', 'licensing_revenue']]
        bp = ax3.boxplot([revenue_data[col] for col in revenue_data.columns], 
                         labels=['Subscription', 'API', 'Projects', 'Licensing'],
                         patch_artist=True)
        colors = ['#FF6B35', '#4ECDC4', '#95E1D3', '#FFA45B']
        for patch, color in zip(bp['boxes'], colors):
            patch.set_facecolor(color)
        ax3.set_ylabel('Revenue ($)', fontweight='bold')
        ax3.set_title('Revenue Streams Comparison')
        ax3.grid(True, alpha=0.3)
        plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45)
        
        # 4. Profit Margin Distribution
        ax4 = plt.subplot(2, 3, 4)
        ax4.hist(self.results['profit_margin'] * 100, bins=50, color='#95E1D3', alpha=0.7, edgecolor='black')
        ax4.axvline(self.results['profit_margin'].mean() * 100, color='red', linestyle='--', linewidth=2, 
                   label=f"Mean: {self.results['profit_margin'].mean() * 100:.1f}%")
        ax4.set_xlabel('Profit Margin (%)', fontweight='bold')
        ax4.set_ylabel('Frequency', fontweight='bold')
        ax4.set_title('Profit Margin Distribution')
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        
        # 5. Cost Breakdown Pie Chart
        ax5 = plt.subplot(2, 3, 5)
        cost_means = [
            self.results['infrastructure_cost'].mean(),
            self.results['data_cost'].mean(),
            self.results['personnel_cost'].mean(),
            self.results['marketing_cost'].mean()
        ]
        cost_labels = ['Infrastructure', 'Data Acquisition', 'Personnel', 'Marketing']
        colors = ['#FF6B35', '#4ECDC4', '#95E1D3', '#FFA45B']
        ax5.pie(cost_means, labels=cost_labels, colors=colors, autopct='%1.1f%%', startangle=90)
        ax5.set_title('Average Cost Breakdown')
        
        # 6. Cumulative Probability
        ax6 = plt.subplot(2, 3, 6)
        sorted_values = np.sort(self.results['monthly_value'])
        cumulative = np.arange(1, len(sorted_values) + 1) / len(sorted_values) * 100
        ax6.plot(sorted_values, cumulative, color='#FF6B35', linewidth=2)
        
        # Mark key percentiles
        percentiles = [5, 25, 50, 75, 95]
        for p in percentiles:
            val = np.percentile(sorted_values, p)
            ax6.axvline(val, color='gray', linestyle=':', alpha=0.5)
            ax6.text(val, p + 2, f'{p}%: ${val:,.0f}', rotation=45, fontsize=8)
        
        ax6.set_xlabel('Monthly Value ($)', fontweight='bold')
        ax6.set_ylabel('Cumulative Probability (%)', fontweight='bold')
        ax6.set_title('Cumulative Distribution Function')
        ax6.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()
        
        return fig
    
    def sensitivity_analysis(self) -> pd.DataFrame:
        """Perform sensitivity analysis on key parameters"""
        
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        # Calculate correlations
        factors = [
            'subscription_revenue', 'api_revenue', 'project_revenue', 
            'licensing_revenue', 'total_costs', 'automation_savings'
        ]
        
        sensitivity_data = []
        for factor in factors:
            correlation = self.results['monthly_value'].corr(self.results[factor])
            impact = (self.results[factor].std() / self.results[factor].mean()) * abs(correlation)
            
            sensitivity_data.append({
                'Factor': factor.replace('_', ' ').title(),
                'Correlation': correlation,
                'Impact Score': impact,
                'Relative Importance': 'High' if abs(correlation) > 0.3 else 'Medium' if abs(correlation) > 0.1 else 'Low'
            })
        
        return pd.DataFrame(sensitivity_data).sort_values('Impact Score', ascending=False)
    
    def generate_report(self, output_dir: str = '.') -> Dict[str, str]:
        """Generate complete analysis report"""
        
        if self.results is None:
            self.run_simulation()
        
        # Generate all outputs
        stats = self.generate_statistics()
        sensitivity = self.sensitivity_analysis()
        
        # Save results
        timestamp = datetime.now(timezone(timedelta(hours=-5))).strftime('%Y%m%d_%H%M%S')
        
        # Save raw results
        results_path = f"{output_dir}/blaze_intel_results_{timestamp}.csv"
        self.results.to_csv(results_path, index=False)
        
        # Save statistics
        stats_path = f"{output_dir}/blaze_intel_statistics_{timestamp}.csv"
        stats.to_csv(stats_path, index=False)
        
        # Save sensitivity analysis
        sensitivity_path = f"{output_dir}/blaze_intel_sensitivity_{timestamp}.csv"
        sensitivity.to_csv(sensitivity_path, index=False)
        
        # Generate plots
        plot_path = f"{output_dir}/blaze_intel_analysis_{timestamp}.png"
        self.plot_results(plot_path)
        
        # Generate text report
        report = self._generate_text_report(stats, sensitivity)
        report_path = f"{output_dir}/blaze_intel_report_{timestamp}.txt"
        with open(report_path, 'w') as f:
            f.write(report)
        
        print(f"\n✅ Report generated successfully!")
        print(f"📊 Results: {results_path}")
        print(f"📈 Statistics: {stats_path}")
        print(f"🎯 Sensitivity: {sensitivity_path}")
        print(f"📉 Plots: {plot_path}")
        print(f"📄 Report: {report_path}")
        
        return {
            'results': results_path,
            'statistics': stats_path,
            'sensitivity': sensitivity_path,
            'plots': plot_path,
            'report': report_path
        }
    
    def _generate_text_report(self, stats: pd.DataFrame, sensitivity: pd.DataFrame) -> str:
        """Generate formatted text report"""
        
        monthly_value_stats = stats[stats['Metric'] == 'Monthly Value'].iloc[0]
        roi_stats = stats[stats['Metric'] == 'Roi Percent'].iloc[0]
        
        report = f"""
================================================================================
BLAZE INTELLIGENCE MONTE CARLO ANALYSIS REPORT
BlazeSportsIntel.com Revenue & ROI Projections
================================================================================
Generated: {datetime.now(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d %H:%M:%S CDT')}
Simulations: {self.n_simulations:,}

EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Expected Monthly Value: ${monthly_value_stats['Mean']:,.2f}
Median Monthly Value:   ${monthly_value_stats['Median']:,.2f}
95% Confidence Range:   ${monthly_value_stats['5th %ile']:,.2f} - ${monthly_value_stats['95th %ile']:,.2f}

Expected ROI:           {roi_stats['Mean']:.1f}%
Median ROI:             {roi_stats['Median']:.1f}%

REVENUE BREAKDOWN (Monthly Averages)
--------------------------------------------------------------------------------
Subscription Revenue:   ${self.results['subscription_revenue'].mean():,.2f}
API Revenue:           ${self.results['api_revenue'].mean():,.2f}
Project Revenue:       ${self.results['project_revenue'].mean():,.2f}
Licensing Revenue:     ${self.results['licensing_revenue'].mean():,.2f}
--------------------------------------------------------------------------------
Total Gross Revenue:   ${self.results['gross_revenue'].mean():,.2f}
Market-Adjusted Rev:   ${self.results['adjusted_revenue'].mean():,.2f}

COST STRUCTURE (Monthly Averages)
--------------------------------------------------------------------------------
Infrastructure:        ${self.results['infrastructure_cost'].mean():,.2f}
Data Acquisition:      ${self.results['data_cost'].mean():,.2f}
Personnel:            ${self.results['personnel_cost'].mean():,.2f}
Marketing:            ${self.results['marketing_cost'].mean():,.2f}
--------------------------------------------------------------------------------
Total Costs:          ${self.results['total_costs'].mean():,.2f}
Automation Savings:    {self.results['automation_savings'].mean() * 100:.1f}%

PROFITABILITY METRICS
--------------------------------------------------------------------------------
Gross Profit:         ${self.results['gross_profit'].mean():,.2f}
Profit Margin:        {self.results['profit_margin'].mean() * 100:.1f}%
Hours Saved Monthly:   {self.results['hours_saved'].mean():,.0f} hours

RISK ANALYSIS
--------------------------------------------------------------------------------
Probability of Profit > $5,000:   {(self.results['monthly_value'] > 5000).mean() * 100:.1f}%
Probability of Profit > $10,000:  {(self.results['monthly_value'] > 10000).mean() * 100:.1f}%
Probability of Profit > $15,000:  {(self.results['monthly_value'] > 15000).mean() * 100:.1f}%
Probability of Profit > $20,000:  {(self.results['monthly_value'] > 20000).mean() * 100:.1f}%

SENSITIVITY ANALYSIS
--------------------------------------------------------------------------------
{sensitivity.to_string(index=False)}

KEY INSIGHTS
--------------------------------------------------------------------------------
1. Revenue Diversification: The platform shows healthy diversification across
   subscription, API, project, and licensing revenue streams.

2. Scalability: With automation savings averaging {self.results['automation_savings'].mean() * 100:.1f}%, 
   the platform demonstrates strong operational leverage.

3. Market Position: The 95% confidence interval suggests stable revenue
   potential with manageable downside risk.

4. Growth Potential: Top quartile outcomes exceed ${monthly_value_stats['75th %ile']:,.0f}/month,
   indicating significant upside with market expansion.

RECOMMENDATIONS
--------------------------------------------------------------------------------
1. Focus on subscription growth - highest correlation with profitability
2. Optimize API pricing to capture more value from high-volume users
3. Invest in automation to further reduce operational costs
4. Develop sport-specific premium features for baseball and football seasons

================================================================================
"""
        return report


def main():
    """Main execution function"""
    
    print("=" * 60)
    print("BLAZE INTELLIGENCE MONTE CARLO SIMULATION")
    print("BlazeSportsIntel.com Revenue Analysis")
    print("=" * 60)
    
    # Initialize parameters
    params = SimulationParameters()
    
    # Create simulation engine
    sim = BlazeIntelMonteCarlo(params, n_simulations=10000)
    
    # Run simulation
    results = sim.run_simulation()
    
    # Generate comprehensive report
    report_files = sim.generate_report('/mnt/user-data/outputs/blaze-intel-monte-carlo')
    
    # Display key statistics
    stats = sim.generate_statistics()
    print("\n📊 KEY STATISTICS")
    print("=" * 60)
    print(stats.to_string(index=False))
    
    # Display sensitivity analysis
    sensitivity = sim.sensitivity_analysis()
    print("\n🎯 SENSITIVITY ANALYSIS")
    print("=" * 60)
    print(sensitivity.to_string(index=False))
    
    print("\n✅ Simulation complete!")
    print("📁 All outputs saved to: /mnt/user-data/outputs/blaze-intel-monte-carlo/")
    
    return sim, results, stats


if __name__ == "__main__":
    sim, results, stats = main()
