#!/usr/bin/env python3
"""
Treatment Timeline Generator
Generates visual treatment timelines from treatment plan files.
"""

import sys
import re
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

# Try to import matplotlib, but make it optional
try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.patches import Rectangle
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False


def extract_timeline_info(content: str) -> Dict[str, List[Tuple[str, str]]]:
    """
    Extract timeline and schedule information from treatment plan.
    Returns dict with phases, appointments, milestones.
    """
    timeline_data = {
        'phases': [],
        'appointments': [],
        'milestones': []
    }
    
    # Extract treatment phases
    # Look for patterns like "Week 1-4: Description" or "Months 1-3: Description"
    phase_patterns = [
        r'(Week[s]?\s*\d+[-–]\d+|Month[s]?\s*\d+[-–]\d+)[:\s]+([^\n]+)',
        r'(POD\s*\d+[-–]\d+)[:\s]+([^\n]+)',
        r'(\d+[-–]\d+\s*week[s]?)[:\s]+([^\n]+)'
    ]
    
    for pattern in phase_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for timeframe, description in matches:
            timeline_data['phases'].append((timeframe.strip(), description.strip()))
    
    # Extract appointments
    # Look for patterns like "Week 2: Visit" or "Month 3: Follow-up"
    apt_patterns = [
        r'(Week\s*\d+|Month\s*\d+|POD\s*\d+)[:\s]+(Visit|Appointment|Follow-up|Check-up|Consultation)([^\n]*)',
        r'(Every\s+\d+\s+\w+)[:\s]+(Visit|Appointment|therapy|session)([^\n]*)'
    ]
    
    for pattern in apt_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for timeframe, visit_type, details in matches:
            timeline_data['appointments'].append((timeframe.strip(), f"{visit_type}{details}".strip()))
    
    # Extract milestones/assessments
    # Look for "reassessment", "goal evaluation", "milestone" mentions
    milestone_patterns = [
        r'(Week\s*\d+|Month\s*\d+)[:\s]+(reassess|evaluation|assessment|milestone)([^\n]*)',
        r'(\w+\s*\d+)[:\s]+(HbA1c|labs?|imaging|test)([^\n]*)'
    ]
    
    for pattern in milestone_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for timeframe, event_type, details in matches:
            timeline_data['milestones'].append((timeframe.strip(), f"{event_type}{details}".strip()))
    
    return timeline_data


def parse_timeframe_to_days(timeframe: str) -> Tuple[int, int]:
    """
    Parse timeframe string to start and end days.
    Examples: "Week 1-4" -> (0, 28), "Month 3" -> (60, 90)
    """
    timeframe = timeframe.lower()
    
    # Week patterns
    if 'week' in timeframe:
        weeks = re.findall(r'\d+', timeframe)
        if len(weeks) == 2:
            start_week = int(weeks[0])
            end_week = int(weeks[1])
            return ((start_week - 1) * 7, end_week * 7)
        elif len(weeks) == 1:
            week = int(weeks[0])
            return ((week - 1) * 7, week * 7)
    
    # Month patterns
    if 'month' in timeframe:
        months = re.findall(r'\d+', timeframe)
        if len(months) == 2:
            start_month = int(months[0])
            end_month = int(months[1])
            return ((start_month - 1) * 30, end_month * 30)
        elif len(months) == 1:
            month = int(months[0])
            return ((month - 1) * 30, month * 30)
    
    # POD (post-operative day) patterns
    if 'pod' in timeframe:
        days = re.findall(r'\d+', timeframe)
        if len(days) == 2:
            return (int(days[0]), int(days[1]))
        elif len(days) == 1:
            day = int(days[0])
            return (day, day + 1)
    
    # Default fallback
    return (0, 7)


def create_text_timeline(timeline_data: Dict, output_file: Path = None):
    """Create a text-based timeline representation."""
    
    lines = []
    lines.append("="*70)
    lines.append("TREATMENT TIMELINE")
    lines.append("="*70)
    
    # Treatment phases
    if timeline_data['phases']:
        lines.append("\nTREATMENT PHASES:")
        lines.append("-"*70)
        for timeframe, description in timeline_data['phases']:
            lines.append(f"{timeframe:20s} | {description}")
    
    # Appointments
    if timeline_data['appointments']:
        lines.append("\nSCHEDULED APPOINTMENTS:")
        lines.append("-"*70)
        for timeframe, details in timeline_data['appointments']:
            lines.append(f"{timeframe:20s} | {details}")
    
    # Milestones
    if timeline_data['milestones']:
        lines.append("\nMILESTONES & ASSESSMENTS:")
        lines.append("-"*70)
        for timeframe, event in timeline_data['milestones']:
            lines.append(f"{timeframe:20s} | {event}")
    
    lines.append("\n" + "="*70)
    
    # Output
    output_text = "\n".join(lines)
    
    if output_file:
        with open(output_file, 'w') as f:
            f.write(output_text)
        print(f"\nText timeline saved to: {output_file}")
    else:
        print(output_text)
    
    return output_text


def create_visual_timeline(timeline_data: Dict, output_file: Path, start_date: str = None):
    """Create a visual Gantt-chart style timeline (requires matplotlib)."""
    
    if not HAS_MATPLOTLIB:
        print("Error: matplotlib not installed. Install with: pip install matplotlib", file=sys.stderr)
        print("Generating text timeline instead...", file=sys.stderr)
        text_output = output_file.with_suffix('.txt')
        create_text_timeline(timeline_data, text_output)
        return
    
    # Parse start date
    if start_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
        except ValueError:
            print(f"Invalid date format: {start_date}. Using today.", file=sys.stderr)
            start = datetime.now()
    else:
        start = datetime.now()
    
    # Prepare data for plotting
    phases = []
    for timeframe, description in timeline_data['phases']:
        start_day, end_day = parse_timeframe_to_days(timeframe)
        phases.append({
            'name': f"{timeframe}: {description[:40]}",
            'start': start + timedelta(days=start_day),
            'end': start + timedelta(days=end_day),
            'type': 'phase'
        })
    
    # Add appointments as events
    events = []
    for timeframe, details in timeline_data['appointments']:
        start_day, _ = parse_timeframe_to_days(timeframe)
        events.append({
            'name': f"{timeframe}: {details[:40]}",
            'date': start + timedelta(days=start_day),
            'type': 'appointment'
        })
    
    # Add milestones
    for timeframe, event in timeline_data['milestones']:
        start_day, _ = parse_timeframe_to_days(timeframe)
        events.append({
            'name': f"{timeframe}: {event[:40]}",
            'date': start + timedelta(days=start_day),
            'type': 'milestone'
        })
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Plot phases as horizontal bars
    y_position = len(phases) + len(events)
    
    for i, phase in enumerate(phases):
        duration = (phase['end'] - phase['start']).days
        ax.barh(y_position - i, duration, left=mdates.date2num(phase['start']),
                height=0.6, color='steelblue', alpha=0.7, edgecolor='black')
        ax.text(mdates.date2num(phase['start']) + duration/2, y_position - i,
                phase['name'], va='center', ha='center', fontsize=9, color='white', weight='bold')
    
    # Plot events as markers
    event_y = y_position - len(phases) - 1
    
    for i, event in enumerate(events):
        marker = 'o' if event['type'] == 'appointment' else 's'
        color = 'green' if event['type'] == 'appointment' else 'orange'
        ax.plot(mdates.date2num(event['date']), event_y - i, marker=marker,
                markersize=10, color=color, markeredgecolor='black')
        ax.text(mdates.date2num(event['date']) + 2, event_y - i, event['name'],
                va='center', ha='left', fontsize=8)
    
    # Format x-axis as dates
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    ax.xaxis.set_major_locator(mdates.MonthLocator())
    plt.xticks(rotation=45, ha='right')
    
    # Labels and title
    ax.set_xlabel('Date', fontsize=12, weight='bold')
    ax.set_title('Treatment Plan Timeline', fontsize=14, weight='bold', pad=20)
    ax.set_yticks([])
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
    # Legend
    from matplotlib.lines import Line2D
    legend_elements = [
        Rectangle((0, 0), 1, 1, fc='steelblue', alpha=0.7, edgecolor='black', label='Treatment Phase'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='green', markersize=10,
               markeredgecolor='black', label='Appointment'),
        Line2D([0], [0], marker='s', color='w', markerfacecolor='orange', markersize=10,
               markeredgecolor='black', label='Milestone/Assessment')
    ]
    ax.legend(handles=legend_elements, loc='upper right', framealpha=0.9)
    
    plt.tight_layout()
    
    # Save
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"\nVisual timeline saved to: {output_file}")
    
    # Close plot
    plt.close()


def main():
    parser = argparse.ArgumentParser(
        description='Generate treatment timeline visualization',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate text timeline
  python timeline_generator.py --plan my_plan.tex

  # Generate visual timeline (requires matplotlib)
  python timeline_generator.py --plan my_plan.tex --output timeline.png --visual

  # Specify start date for visual timeline
  python timeline_generator.py --plan my_plan.tex --output timeline.pdf --visual --start 2025-02-01

Output formats:
  Text: .txt
  Visual: .png, .pdf, .svg (requires matplotlib)

Note: Visual timeline generation requires matplotlib.
  Install with: pip install matplotlib
        """
    )
    
    parser.add_argument(
        '--plan',
        type=Path,
        required=True,
        help='Treatment plan file to analyze (.tex format)'
    )
    
    parser.add_argument(
        '--output',
        type=Path,
        help='Output file (default: timeline.txt or timeline.png if --visual)'
    )
    
    parser.add_argument(
        '--visual',
        action='store_true',
        help='Generate visual timeline (requires matplotlib)'
    )
    
    parser.add_argument(
        '--start',
        help='Start date for timeline (YYYY-MM-DD format, default: today)'
    )
    
    args = parser.parse_args()
    
    # Check plan file exists
    if not args.plan.exists():
        print(f"Error: File not found: {args.plan}", file=sys.stderr)
        sys.exit(1)
    
    # Read plan
    try:
        with open(args.plan, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Extract timeline information
    print("Extracting timeline information from treatment plan...")
    timeline_data = extract_timeline_info(content)
    
    # Check if any timeline info found
    total_items = (len(timeline_data['phases']) +
                   len(timeline_data['appointments']) +
                   len(timeline_data['milestones']))
    
    if total_items == 0:
        print("\nWarning: No timeline information detected in treatment plan.", file=sys.stderr)
        print("The plan may not contain structured timeline/schedule sections.", file=sys.stderr)
        print("\nTip: Include sections with timeframes like:", file=sys.stderr)
        print("  - Week 1-4: Initial phase", file=sys.stderr)
        print("  - Month 3: Follow-up visit", file=sys.stderr)
        sys.exit(1)
    
    print(f"Found {len(timeline_data['phases'])} phase(s), "
          f"{len(timeline_data['appointments'])} appointment(s), "
          f"{len(timeline_data['milestones'])} milestone(s)")
    
    # Determine output file
    if not args.output:
        if args.visual:
            args.output = Path('timeline.png')
        else:
            args.output = Path('timeline.txt')
    
    # Generate timeline
    if args.visual:
        create_visual_timeline(timeline_data, args.output, args.start)
    else:
        create_text_timeline(timeline_data, args.output)
    
    print(f"\nTimeline generation complete!")


if __name__ == '__main__':
    main()

