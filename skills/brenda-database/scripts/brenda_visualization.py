"""
BRENDA Database Visualization Utilities

This module provides visualization functions for BRENDA enzyme data,
including kinetic parameters, environmental conditions, and pathway analysis.

Key features:
- Plot Km, kcat, and Vmax distributions
- Compare enzyme properties across organisms
- Visualize pH and temperature activity profiles
- Plot substrate specificity and affinity data
- Generate Michaelis-Menten curves
- Create heatmaps and correlation plots
- Support for pathway visualization

Installation:
    uv pip install matplotlib seaborn pandas numpy

Usage:
    from scripts.brenda_visualization import plot_kinetic_parameters, plot_michaelis_menten

    plot_kinetic_parameters("1.1.1.1")
    plot_michaelis_menten("1.1.1.1", substrate="ethanol")
"""

import math
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("Warning: pandas not installed. Install with: uv pip install pandas")
    PANDAS_AVAILABLE = False

try:
    from brenda_queries import (
        get_km_values, get_reactions, parse_km_entry, parse_reaction_entry,
        compare_across_organisms, get_environmental_parameters,
        get_substrate_specificity, get_modeling_parameters,
        search_enzymes_by_substrate, search_by_pattern
    )
    BRENDA_QUERIES_AVAILABLE = True
except ImportError:
    print("Warning: brenda_queries not available")
    BRENDA_QUERIES_AVAILABLE = False


# Set style for plots
plt.style.use('default')
sns.set_palette("husl")


def validate_dependencies():
    """Validate that required dependencies are installed."""
    missing = []
    if not PANDAS_AVAILABLE:
        missing.append("pandas")
    if not BRENDA_QUERIES_AVAILABLE:
        missing.append("brenda_queries")
    if missing:
        raise ImportError(f"Missing required dependencies: {', '.join(missing)}")


def plot_kinetic_parameters(ec_number: str, save_path: str = None, show_plot: bool = True) -> str:
    """Plot kinetic parameter distributions for an enzyme."""
    validate_dependencies()

    try:
        # Get Km data
        km_data = get_km_values(ec_number)

        if not km_data:
            print(f"No kinetic data found for EC {ec_number}")
            return save_path

        # Parse data
        parsed_entries = []
        for entry in km_data:
            parsed = parse_km_entry(entry)
            if 'km_value_numeric' in parsed:
                parsed_entries.append(parsed)

        if not parsed_entries:
            print(f"No numeric Km data found for EC {ec_number}")
            return save_path

        # Create figure with subplots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Kinetic Parameters for EC {ec_number}', fontsize=16, fontweight='bold')

        # Extract data
        km_values = [entry['km_value_numeric'] for entry in parsed_entries]
        organisms = [entry.get('organism', 'Unknown') for entry in parsed_entries]
        substrates = [entry.get('substrate', 'Unknown') for entry in parsed_entries]

        # Plot 1: Km distribution histogram
        ax1.hist(km_values, bins=30, alpha=0.7, edgecolor='black')
        ax1.set_xlabel('Km (mM)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Km Value Distribution')
        ax1.axvline(np.mean(km_values), color='red', linestyle='--', label=f'Mean: {np.mean(km_values):.2f}')
        ax1.axvline(np.median(km_values), color='blue', linestyle='--', label=f'Median: {np.median(km_values):.2f}')
        ax1.legend()

        # Plot 2: Km by organism (top 10)
        if PANDAS_AVAILABLE:
            df = pd.DataFrame({'Km': km_values, 'Organism': organisms})
            organism_means = df.groupby('Organism')['Km'].mean().sort_values(ascending=False).head(10)

            organism_means.plot(kind='bar', ax=ax2)
            ax2.set_ylabel('Mean Km (mM)')
            ax2.set_title('Mean Km by Organism (Top 10)')
            ax2.tick_params(axis='x', rotation=45)

        # Plot 3: Km by substrate (top 10)
        if PANDAS_AVAILABLE:
            df = pd.DataFrame({'Km': km_values, 'Substrate': substrates})
            substrate_means = df.groupby('Substrate')['Km'].mean().sort_values(ascending=False).head(10)

            substrate_means.plot(kind='bar', ax=ax3)
            ax3.set_ylabel('Mean Km (mM)')
            ax3.set_title('Mean Km by Substrate (Top 10)')
            ax3.tick_params(axis='x', rotation=45)

        # Plot 4: Box plot by organism (top 5)
        if PANDAS_AVAILABLE:
            top_organisms = df.groupby('Organism')['Km'].count().sort_values(ascending=False).head(5).index
            top_data = df[df['Organism'].isin(top_organisms)]

            sns.boxplot(data=top_data, x='Organism', y='Km', ax=ax4)
            ax4.set_ylabel('Km (mM)')
            ax4.set_title('Km Distribution by Organism (Top 5)')
            ax4.tick_params(axis='x', rotation=45)

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Kinetic parameters plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"kinetic_parameters_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting kinetic parameters: {e}")
        return save_path


def plot_organism_comparison(ec_number: str, organisms: List[str], save_path: str = None, show_plot: bool = True) -> str:
    """Compare enzyme properties across multiple organisms."""
    validate_dependencies()

    try:
        # Get comparison data
        comparison = compare_across_organisms(ec_number, organisms)

        if not comparison:
            print(f"No comparison data found for EC {ec_number}")
            return save_path

        # Filter out entries with no data
        valid_data = [c for c in comparison if c.get('data_points', 0) > 0]

        if not valid_data:
            print(f"No valid data for organism comparison of EC {ec_number}")
            return save_path

        # Create figure
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Organism Comparison for EC {ec_number}', fontsize=16, fontweight='bold')

        # Extract data
        names = [c['organism'] for c in valid_data]
        avg_kms = [c.get('average_km', 0) for c in valid_data if c.get('average_km')]
        optimal_phs = [c.get('optimal_ph', 0) for c in valid_data if c.get('optimal_ph')]
        optimal_temps = [c.get('optimal_temperature', 0) for c in valid_data if c.get('optimal_temperature')]
        data_points = [c.get('data_points', 0) for c in valid_data]

        # Plot 1: Average Km comparison
        if avg_kms:
            ax1.bar(names, avg_kms)
            ax1.set_ylabel('Average Km (mM)')
            ax1.set_title('Average Km Comparison')
            ax1.tick_params(axis='x', rotation=45)

        # Plot 2: Optimal pH comparison
        if optimal_phs:
            ax2.bar(names, optimal_phs)
            ax2.set_ylabel('Optimal pH')
            ax2.set_title('Optimal pH Comparison')
            ax2.tick_params(axis='x', rotation=45)

        # Plot 3: Optimal temperature comparison
        if optimal_temps:
            ax3.bar(names, optimal_temps)
            ax3.set_ylabel('Optimal Temperature (°C)')
            ax3.set_title('Optimal Temperature Comparison')
            ax3.tick_params(axis='x', rotation=45)

        # Plot 4: Data points comparison
        ax4.bar(names, data_points)
        ax4.set_ylabel('Number of Data Points')
        ax4.set_title('Available Data Points')
        ax4.tick_params(axis='x', rotation=45)

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Organism comparison plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"organism_comparison_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting organism comparison: {e}")
        return save_path


def plot_pH_profiles(ec_number: str, save_path: str = None, show_plot: bool = True) -> str:
    """Plot pH activity profiles for an enzyme."""
    validate_dependencies()

    try:
        # Get kinetic data
        km_data = get_km_values(ec_number)

        if not km_data:
            print(f"No pH data found for EC {ec_number}")
            return save_path

        # Parse data and extract pH information
        ph_kms = []
        ph_organisms = []

        for entry in km_data:
            parsed = parse_km_entry(entry)
            if 'ph' in parsed and 'km_value_numeric' in parsed:
                ph_kms.append((parsed['ph'], parsed['km_value_numeric']))
                ph_organisms.append(parsed.get('organism', 'Unknown'))

        if not ph_kms:
            print(f"No pH-Km data found for EC {ec_number}")
            return save_path

        # Create figure
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        fig.suptitle(f'pH Activity Profiles for EC {ec_number}', fontsize=16, fontweight='bold')

        # Extract data
        ph_values = [item[0] for item in ph_kms]
        km_values = [item[1] for item in ph_kms]

        # Plot 1: pH vs Km scatter plot
        scatter = ax1.scatter(ph_values, km_values, alpha=0.6, s=50)
        ax1.set_xlabel('pH')
        ax1.set_ylabel('Km (mM)')
        ax1.set_title('pH vs Km Values')
        ax1.grid(True, alpha=0.3)

        # Add trend line
        if len(ph_values) > 2:
            z = np.polyfit(ph_values, km_values, 1)
            p = np.poly1d(z)
            ax1.plot(ph_values, p(ph_values), "r--", alpha=0.8, label=f'Trend: y={z[0]:.3f}x+{z[1]:.3f}')
            ax1.legend()

        # Plot 2: pH distribution histogram
        ax2.hist(ph_values, bins=20, alpha=0.7, edgecolor='black')
        ax2.set_xlabel('pH')
        ax2.set_ylabel('Frequency')
        ax2.set_title('pH Distribution')
        ax2.axvline(np.mean(ph_values), color='red', linestyle='--', label=f'Mean: {np.mean(ph_values):.2f}')
        ax2.axvline(np.median(ph_values), color='blue', linestyle='--', label=f'Median: {np.median(ph_values):.2f}')
        ax2.legend()

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"pH profile plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"ph_profile_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting pH profiles: {e}")
        return save_path


def plot_temperature_profiles(ec_number: str, save_path: str = None, show_plot: bool = True) -> str:
    """Plot temperature activity profiles for an enzyme."""
    validate_dependencies()

    try:
        # Get kinetic data
        km_data = get_km_values(ec_number)

        if not km_data:
            print(f"No temperature data found for EC {ec_number}")
            return save_path

        # Parse data and extract temperature information
        temp_kms = []
        temp_organisms = []

        for entry in km_data:
            parsed = parse_km_entry(entry)
            if 'temperature' in parsed and 'km_value_numeric' in parsed:
                temp_kms.append((parsed['temperature'], parsed['km_value_numeric']))
                temp_organisms.append(parsed.get('organism', 'Unknown'))

        if not temp_kms:
            print(f"No temperature-Km data found for EC {ec_number}")
            return save_path

        # Create figure
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        fig.suptitle(f'Temperature Activity Profiles for EC {ec_number}', fontsize=16, fontweight='bold')

        # Extract data
        temp_values = [item[0] for item in temp_kms]
        km_values = [item[1] for item in temp_kms]

        # Plot 1: Temperature vs Km scatter plot
        scatter = ax1.scatter(temp_values, km_values, alpha=0.6, s=50)
        ax1.set_xlabel('Temperature (°C)')
        ax1.set_ylabel('Km (mM)')
        ax1.set_title('Temperature vs Km Values')
        ax1.grid(True, alpha=0.3)

        # Add trend line
        if len(temp_values) > 2:
            z = np.polyfit(temp_values, km_values, 2)  # Quadratic fit for temperature optima
            p = np.poly1d(z)
            x_smooth = np.linspace(min(temp_values), max(temp_values), 100)
            ax1.plot(x_smooth, p(x_smooth), "r--", alpha=0.8, label='Polynomial fit')

            # Find optimum temperature
            optimum_idx = np.argmin(p(x_smooth))
            optimum_temp = x_smooth[optimum_idx]
            ax1.axvline(optimum_temp, color='green', linestyle=':', label=f'Optimal: {optimum_temp:.1f}°C')
            ax1.legend()

        # Plot 2: Temperature distribution histogram
        ax2.hist(temp_values, bins=20, alpha=0.7, edgecolor='black')
        ax2.set_xlabel('Temperature (°C)')
        ax2.set_ylabel('Frequency')
        ax2.set_title('Temperature Distribution')
        ax2.axvline(np.mean(temp_values), color='red', linestyle='--', label=f'Mean: {np.mean(temp_values):.1f}°C')
        ax2.axvline(np.median(temp_values), color='blue', linestyle='--', label=f'Median: {np.median(temp_values):.1f}°C')
        ax2.legend()

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Temperature profile plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"temperature_profile_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting temperature profiles: {e}")
        return save_path


def plot_substrate_specificity(ec_number: str, save_path: str = None, show_plot: bool = True) -> str:
    """Plot substrate specificity and affinity for an enzyme."""
    validate_dependencies()

    try:
        # Get substrate specificity data
        specificity = get_substrate_specificity(ec_number)

        if not specificity:
            print(f"No substrate specificity data found for EC {ec_number}")
            return save_path

        # Create figure
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle(f'Substrate Specificity for EC {ec_number}', fontsize=16, fontweight='bold')

        # Extract data
        substrates = [s['name'] for s in specificity]
        kms = [s['km'] for s in specificity if s.get('km')]
        data_points = [s['data_points'] for s in specificity]

        # Get top substrates for plotting
        if PANDAS_AVAILABLE and kms:
            df = pd.DataFrame({'Substrate': substrates, 'Km': kms, 'DataPoints': data_points})
            top_substrates = df.nlargest(15, 'DataPoints')  # Top 15 by data points

            # Plot 1: Km values for top substrates (sorted by affinity)
            top_sorted = top_substrates.sort_values('Km')
            ax1.barh(range(len(top_sorted)), top_sorted['Km'])
            ax1.set_yticks(range(len(top_sorted)))
            ax1.set_yticklabels([s[:30] + '...' if len(s) > 30 else s for s in top_sorted['Substrate']])
            ax1.set_xlabel('Km (mM)')
            ax1.set_title('Substrate Affinity (Lower Km = Higher Affinity)')
            ax1.invert_yaxis()  # Best affinity at top

            # Plot 2: Data points by substrate
            ax2.barh(range(len(top_sorted)), top_sorted['DataPoints'])
            ax2.set_yticks(range(len(top_sorted)))
            ax2.set_yticklabels([s[:30] + '...' if len(s) > 30 else s for s in top_sorted['Substrate']])
            ax2.set_xlabel('Number of Data Points')
            ax2.set_title('Data Availability by Substrate')
            ax2.invert_yaxis()

            # Plot 3: Km distribution
            ax3.hist(kms, bins=20, alpha=0.7, edgecolor='black')
            ax3.set_xlabel('Km (mM)')
            ax3.set_ylabel('Frequency')
            ax3.set_title('Km Value Distribution')
            ax3.axvline(np.mean(kms), color='red', linestyle='--', label=f'Mean: {np.mean(kms):.2f}')
            ax3.axvline(np.median(kms), color='blue', linestyle='--', label=f'Median: {np.median(kms):.2f}')
            ax3.legend()

            # Plot 4: Km vs Data Points scatter
            ax4.scatter(df['DataPoints'], df['Km'], alpha=0.6)
            ax4.set_xlabel('Number of Data Points')
            ax4.set_ylabel('Km (mM)')
            ax4.set_title('Km vs Data Points')
            ax4.grid(True, alpha=0.3)

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Substrate specificity plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"substrate_specificity_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting substrate specificity: {e}")
        return save_path


def plot_michaelis_menten(ec_number: str, substrate: str = None, save_path: str = None, show_plot: bool = True) -> str:
    """Generate Michaelis-Menten curves for an enzyme."""
    validate_dependencies()

    try:
        # Get modeling parameters
        model_data = get_modeling_parameters(ec_number, substrate)

        if not model_data or model_data.get('error'):
            print(f"No modeling data found for EC {ec_number}")
            return save_path

        km = model_data.get('km')
        vmax = model_data.get('vmax')
        kcat = model_data.get('kcat')
        enzyme_conc = model_data.get('enzyme_conc', 1.0)

        if not km:
            print(f"No Km data available for plotting")
            return save_path

        # Create figure
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        fig.suptitle(f'Michaelis-Menten Kinetics for EC {ec_number}' + (f' - {substrate}' if substrate else ''),
                     fontsize=16, fontweight='bold')

        # Generate substrate concentration range
        substrate_range = np.linspace(0, km * 5, 1000)

        # Calculate reaction rates
        if vmax:
            # Use actual Vmax if available
            rates = (vmax * substrate_range) / (km + substrate_range)
        elif kcat and enzyme_conc:
            # Calculate Vmax from kcat and enzyme concentration
            vmax_calc = kcat * enzyme_conc
            rates = (vmax_calc * substrate_range) / (km + substrate_range)
        else:
            # Use normalized Vmax = 1.0
            rates = substrate_range / (km + substrate_range)

        # Plot 1: Michaelis-Menten curve
        ax1.plot(substrate_range, rates, 'b-', linewidth=2, label='Michaelis-Menten')
        ax1.axhline(y=rates[-1] * 0.5, color='r', linestyle='--', alpha=0.7, label='0.5 × Vmax')
        ax1.axvline(x=km, color='g', linestyle='--', alpha=0.7, label=f'Km = {km:.2f}')
        ax1.set_xlabel('Substrate Concentration (mM)')
        ax1.set_ylabel('Reaction Rate')
        ax1.set_title('Michaelis-Menten Curve')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Add annotation for Km
        km_rate = (substrate_range[km == min(substrate_range, key=lambda x: abs(x-km))] *
                  (vmax if vmax else kcat * enzyme_conc if kcat else 1.0)) / (km +
                  substrate_range[km == min(substrate_range, key=lambda x: abs(x-km))])
        ax1.plot(km, km_rate, 'ro', markersize=8)

        # Plot 2: Lineweaver-Burk plot (double reciprocal)
        substrate_range_nonzero = substrate_range[substrate_range > 0]
        rates_nonzero = rates[substrate_range > 0]

        reciprocal_substrate = 1 / substrate_range_nonzero
        reciprocal_rate = 1 / rates_nonzero

        ax2.scatter(reciprocal_substrate, reciprocal_rate, alpha=0.6, s=10)

        # Fit linear regression
        z = np.polyfit(reciprocal_substrate, reciprocal_rate, 1)
        p = np.poly1d(z)
        x_fit = np.linspace(min(reciprocal_substrate), max(reciprocal_substrate), 100)
        ax2.plot(x_fit, p(x_fit), 'r-', linewidth=2, label=f'1/Vmax = {z[1]:.3f}')

        ax2.set_xlabel('1/[Substrate] (1/mM)')
        ax2.set_ylabel('1/Rate')
        ax2.set_title('Lineweaver-Burk Plot')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        # Add parameter information
        info_text = f"Km = {km:.3f} mM"
        if vmax:
            info_text += f"\nVmax = {vmax:.3f}"
        if kcat:
            info_text += f"\nkcat = {kcat:.3f} s⁻¹"
        if enzyme_conc:
            info_text += f"\n[Enzyme] = {enzyme_conc:.3f} μM"

        fig.text(0.02, 0.98, info_text, transform=fig.transFigure,
                fontsize=10, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Michaelis-Menten plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"michaelis_menten_{ec_number.replace('.', '_')}_{substrate or 'all'}.png"

    except Exception as e:
        print(f"Error plotting Michaelis-Menten: {e}")
        return save_path


def create_heatmap_data(ec_number: str, parameters: List[str] = None) -> Dict[str, Any]:
    """Create data for heatmap visualization."""
    validate_dependencies()

    try:
        # Get comparison data across organisms
        organisms = ["Escherichia coli", "Saccharomyces cerevisiae", "Bacillus subtilis",
                    "Homo sapiens", "Mus musculus", "Rattus norvegicus"]
        comparison = compare_across_organisms(ec_number, organisms)

        if not comparison:
            return None

        # Create heatmap data
        heatmap_data = {
            'organisms': [],
            'average_km': [],
            'optimal_ph': [],
            'optimal_temperature': [],
            'data_points': []
        }

        for comp in comparison:
            if comp.get('data_points', 0) > 0:
                heatmap_data['organisms'].append(comp['organism'])
                heatmap_data['average_km'].append(comp.get('average_km', 0))
                heatmap_data['optimal_ph'].append(comp.get('optimal_ph', 0))
                heatmap_data['optimal_temperature'].append(comp.get('optimal_temperature', 0))
                heatmap_data['data_points'].append(comp.get('data_points', 0))

        return heatmap_data

    except Exception as e:
        print(f"Error creating heatmap data: {e}")
        return None


def plot_heatmap(ec_number: str, save_path: str = None, show_plot: bool = True) -> str:
    """Create heatmap visualization of enzyme properties."""
    validate_dependencies()

    try:
        heatmap_data = create_heatmap_data(ec_number)

        if not heatmap_data or not heatmap_data['organisms']:
            print(f"No heatmap data available for EC {ec_number}")
            return save_path

        if not PANDAS_AVAILABLE:
            print("pandas required for heatmap plotting")
            return save_path

        # Create DataFrame for heatmap
        df = pd.DataFrame({
            'Organism': heatmap_data['organisms'],
            'Avg Km (mM)': heatmap_data['average_km'],
            'Optimal pH': heatmap_data['optimal_ph'],
            'Optimal Temp (°C)': heatmap_data['optimal_temperature'],
            'Data Points': heatmap_data['data_points']
        })

        # Normalize data for better visualization
        df_normalized = df.copy()
        for col in ['Avg Km (mM)', 'Optimal pH', 'Optimal Temp (°C)', 'Data Points']:
            if col in df.columns:
                df_normalized[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())

        # Create figure
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))
        fig.suptitle(f'Enzyme Properties Heatmap for EC {ec_number}', fontsize=16, fontweight='bold')

        # Plot 1: Raw data heatmap
        heatmap_data_raw = df.set_index('Organism')[['Avg Km (mM)', 'Optimal pH', 'Optimal Temp (°C)', 'Data Points']].T
        sns.heatmap(heatmap_data_raw, annot=True, fmt='.2f', cmap='viridis', ax=ax1)
        ax1.set_title('Raw Values')

        # Plot 2: Normalized data heatmap
        heatmap_data_norm = df_normalized.set_index('Organism')[['Avg Km (mM)', 'Optimal pH', 'Optimal Temp (°C)', 'Data Points']].T
        sns.heatmap(heatmap_data_norm, annot=True, fmt='.2f', cmap='viridis', ax=ax2)
        ax2.set_title('Normalized Values (0-1)')

        plt.tight_layout()

        # Save plot
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Heatmap plot saved to {save_path}")

        if show_plot:
            plt.show()
        else:
            plt.close()

        return save_path or f"heatmap_{ec_number.replace('.', '_')}.png"

    except Exception as e:
        print(f"Error plotting heatmap: {e}")
        return save_path


def generate_summary_plots(ec_number: str, save_dir: str = None) -> List[str]:
    """Generate a comprehensive set of plots for an enzyme."""
    validate_dependencies()

    if save_dir is None:
        save_dir = f"enzyme_plots_{ec_number.replace('.', '_')}"

    # Create save directory
    Path(save_dir).mkdir(exist_ok=True)

    generated_files = []

    # Generate all plot types
    plot_functions = [
        ('kinetic_parameters', plot_kinetic_parameters),
        ('ph_profiles', plot_pH_profiles),
        ('temperature_profiles', plot_temperature_profiles),
        ('substrate_specificity', plot_substrate_specificity),
        ('heatmap', plot_heatmap),
    ]

    for plot_name, plot_func in plot_functions:
        try:
            save_path = f"{save_dir}/{plot_name}_{ec_number.replace('.', '_')}.png"
            result_path = plot_func(ec_number, save_path=save_path, show_plot=False)
            if result_path:
                generated_files.append(result_path)
                print(f"Generated {plot_name} plot")
            else:
                print(f"Failed to generate {plot_name} plot")
        except Exception as e:
            print(f"Error generating {plot_name} plot: {e}")

    # Generate organism comparison for common model organisms
    model_organisms = ["Escherichia coli", "Saccharomyces cerevisiae", "Homo sapiens"]
    try:
        save_path = f"{save_dir}/organism_comparison_{ec_number.replace('.', '_')}.png"
        result_path = plot_organism_comparison(ec_number, model_organisms, save_path=save_path, show_plot=False)
        if result_path:
            generated_files.append(result_path)
            print("Generated organism comparison plot")
    except Exception as e:
        print(f"Error generating organism comparison plot: {e}")

    # Generate Michaelis-Menten plot for most common substrate
    try:
        specificity = get_substrate_specificity(ec_number)
        if specificity:
            most_common = max(specificity, key=lambda x: x.get('data_points', 0))
            substrate_name = most_common['name'].split()[0]  # Take first word
            save_path = f"{save_dir}/michaelis_menten_{ec_number.replace('.', '_')}_{substrate_name}.png"
            result_path = plot_michaelis_menten(ec_number, substrate_name, save_path=save_path, show_plot=False)
            if result_path:
                generated_files.append(result_path)
                print(f"Generated Michaelis-Menten plot for {substrate_name}")
    except Exception as e:
        print(f"Error generating Michaelis-Menten plot: {e}")

    print(f"\nGenerated {len(generated_files)} plots in directory: {save_dir}")
    return generated_files


if __name__ == "__main__":
    # Example usage
    print("BRENDA Visualization Examples")
    print("=" * 40)

    try:
        ec_number = "1.1.1.1"  # Alcohol dehydrogenase

        print(f"\n1. Generating kinetic parameters plot for EC {ec_number}")
        plot_kinetic_parameters(ec_number, show_plot=False)

        print(f"\n2. Generating pH profile plot for EC {ec_number}")
        plot_pH_profiles(ec_number, show_plot=False)

        print(f"\n3. Generating substrate specificity plot for EC {ec_number}")
        plot_substrate_specificity(ec_number, show_plot=False)

        print(f"\n4. Generating Michaelis-Menten plot for EC {ec_number}")
        plot_michaelis_menten(ec_number, substrate="ethanol", show_plot=False)

        print(f"\n5. Generating organism comparison plot for EC {ec_number}")
        organisms = ["Escherichia coli", "Saccharomyces cerevisiae", "Homo sapiens"]
        plot_organism_comparison(ec_number, organisms, show_plot=False)

        print(f"\n6. Generating comprehensive summary plots for EC {ec_number}")
        summary_files = generate_summary_plots(ec_number, show_plot=False)
        print(f"Generated {len(summary_files)} summary plots")

    except Exception as e:
        print(f"Example failed: {e}")