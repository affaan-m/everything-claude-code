#!/usr/bin/env python3
"""
Build Clinical Decision Tree Flowcharts in TikZ Format

Generates LaTeX/TikZ code for clinical decision algorithms from
simple text or YAML descriptions.

Dependencies: pyyaml (optional, for YAML input)
"""

import argparse
from pathlib import Path
import json


class DecisionNode:
    """Represents a decision point in the clinical algorithm."""
    
    def __init__(self, question, yes_path=None, no_path=None, node_id=None):
        self.question = question
        self.yes_path = yes_path
        self.no_path = no_path
        self.node_id = node_id or self._generate_id(question)
    
    def _generate_id(self, text):
        """Generate clean node ID from text."""
        return ''.join(c for c in text if c.isalnum())[:15].lower()


class ActionNode:
    """Represents an action/outcome in the clinical algorithm."""
    
    def __init__(self, action, urgency='routine', node_id=None):
        self.action = action
        self.urgency = urgency  # 'urgent', 'semiurgent', 'routine'
        self.node_id = node_id or self._generate_id(action)
    
    def _generate_id(self, text):
        return ''.join(c for c in text if c.isalnum())[:15].lower()


def generate_tikz_header():
    """Generate TikZ preamble with style definitions."""
    
    tikz = """\\documentclass[10pt]{article}
\\usepackage[margin=0.5in, landscape]{geometry}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows,positioning}
\\usepackage{xcolor}

% Color definitions
\\definecolor{urgentred}{RGB}{220,20,60}
\\definecolor{actiongreen}{RGB}{0,153,76}
\\definecolor{decisionyellow}{RGB}{255,193,7}
\\definecolor{routineblue}{RGB}{100,181,246}
\\definecolor{headerblue}{RGB}{0,102,204}

% TikZ styles
\\tikzstyle{startstop} = [rectangle, rounded corners=8pt, minimum width=3cm, minimum height=1cm, 
                          text centered, draw=black, fill=headerblue!20, font=\\small\\bfseries]
\\tikzstyle{decision} = [diamond, minimum width=3cm, minimum height=1.2cm, text centered, 
                        draw=black, fill=decisionyellow!40, font=\\small, aspect=2, inner sep=0pt,
                        text width=3.5cm]
\\tikzstyle{process} = [rectangle, rounded corners=4pt, minimum width=3.5cm, minimum height=0.9cm, 
                       text centered, draw=black, fill=actiongreen!20, font=\\small]
\\tikzstyle{urgent} = [rectangle, rounded corners=4pt, minimum width=3.5cm, minimum height=0.9cm, 
                      text centered, draw=urgentred, line width=1.5pt, fill=urgentred!15, 
                      font=\\small\\bfseries]
\\tikzstyle{routine} = [rectangle, rounded corners=4pt, minimum width=3.5cm, minimum height=0.9cm, 
                       text centered, draw=black, fill=routineblue!20, font=\\small]
\\tikzstyle{arrow} = [thick,->,>=stealth]
\\tikzstyle{urgentarrow} = [ultra thick,->,>=stealth,color=urgentred]

\\begin{document}

\\begin{center}
{\\Large\\bfseries Clinical Decision Algorithm}\\\\[10pt]
{\\large [TITLE TO BE SPECIFIED]}
\\end{center}

\\vspace{10pt}

\\begin{tikzpicture}[node distance=2.2cm and 3.5cm, auto]

"""
    
    return tikz


def generate_tikz_footer():
    """Generate TikZ closing code."""
    
    tikz = """
\\end{tikzpicture}

\\end{document}
"""
    
    return tikz


def simple_algorithm_to_tikz(algorithm_text, output_file='algorithm.tex'):
    """
    Convert simple text-based algorithm to TikZ flowchart.
    
    Input format (simple question-action pairs):
    START: Chief complaint
    Q1: High-risk criteria present? -> YES: Immediate action (URGENT) | NO: Continue
    Q2: Risk score >= 3? -> YES: Admit ICU | NO: Outpatient management (ROUTINE)
    END: Final outcome
    
    Parameters:
        algorithm_text: Multi-line string with algorithm
        output_file: Path to save .tex file
    """
    
    tikz_code = generate_tikz_header()
    
    # Parse algorithm text
    lines = [line.strip() for line in algorithm_text.strip().split('\n') if line.strip()]
    
    node_defs = []
    arrow_defs = []
    
    previous_node = None
    node_counter = 0
    
    for line in lines:
        if line.startswith('START:'):
            # Start node
            text = line.replace('START:', '').strip()
            node_id = 'start'
            node_defs.append(f"\\node [startstop] ({node_id}) {{{text}}};")
            previous_node = node_id
            node_counter += 1
        
        elif line.startswith('END:'):
            # End node
            text = line.replace('END:', '').strip()
            node_id = 'end'
            
            # Position relative to previous
            if previous_node:
                node_defs.append(f"\\node [startstop, below=of {previous_node}] ({node_id}) {{{text}}};")
                arrow_defs.append(f"\\draw [arrow] ({previous_node}) -- ({node_id});")
        
        elif line.startswith('Q'):
            # Decision node
            parts = line.split(':', 1)
            if len(parts) < 2:
                continue
            
            question_part = parts[1].split('->')[0].strip()
            node_id = f'q{node_counter}'
            
            # Add decision node
            if previous_node:
                node_defs.append(f"\\node [decision, below=of {previous_node}] ({node_id}) {{{question_part}}};")
                arrow_defs.append(f"\\draw [arrow] ({previous_node}) -- ({node_id});")
            else:
                node_defs.append(f"\\node [decision] ({node_id}) {{{question_part}}};")
            
            # Parse YES and NO branches
            if '->' in line:
                branches = line.split('->')[1].split('|')
                
                for branch in branches:
                    branch = branch.strip()
                    
                    if branch.startswith('YES:'):
                        yes_action = branch.replace('YES:', '').strip()
                        yes_id = f'yes{node_counter}'
                        
                        # Check urgency
                        if '(URGENT)' in yes_action:
                            style = 'urgent'
                            yes_action = yes_action.replace('(URGENT)', '').strip()
                            arrow_style = 'urgentarrow'
                        elif '(ROUTINE)' in yes_action:
                            style = 'routine'
                            yes_action = yes_action.replace('(ROUTINE)', '').strip()
                            arrow_style = 'arrow'
                        else:
                            style = 'process'
                            arrow_style = 'arrow'
                        
                        node_defs.append(f"\\node [{style}, left=of {node_id}] ({yes_id}) {{{yes_action}}};")
                        arrow_defs.append(f"\\draw [{arrow_style}] ({node_id}) -- node[above] {{Yes}} ({yes_id});")
                    
                    elif branch.startswith('NO:'):
                        no_action = branch.replace('NO:', '').strip()
                        no_id = f'no{node_counter}'
                        
                        # Check urgency
                        if '(URGENT)' in no_action:
                            style = 'urgent'
                            no_action = no_action.replace('(URGENT)', '').strip()
                            arrow_style = 'urgentarrow'
                        elif '(ROUTINE)' in no_action:
                            style = 'routine'
                            no_action = no_action.replace('(ROUTINE)', '').strip()
                            arrow_style = 'arrow'
                        else:
                            style = 'process'
                            arrow_style = 'arrow'
                        
                        node_defs.append(f"\\node [{style}, right=of {node_id}] ({no_id}) {{{no_action}}};")
                        arrow_defs.append(f"\\draw [{arrow_style}] ({node_id}) -- node[above] {{No}} ({no_id});")
            
            previous_node = node_id
            node_counter += 1
    
    # Add all nodes and arrows to TikZ
    tikz_code += '\n'.join(node_defs) + '\n\n'
    tikz_code += '% Arrows\n'
    tikz_code += '\n'.join(arrow_defs) + '\n'
    
    tikz_code += generate_tikz_footer()
    
    # Save to file
    with open(output_file, 'w') as f:
        f.write(tikz_code)
    
    print(f"TikZ flowchart saved to: {output_file}")
    print(f"Compile with: pdflatex {output_file}")
    
    return tikz_code


def json_to_tikz(json_file, output_file='algorithm.tex'):
    """
    Convert JSON decision tree specification to TikZ flowchart.
    
    JSON format:
    {
        "title": "Algorithm Title",
        "nodes": {
            "start": {"type": "start", "text": "Patient presentation"},
            "q1": {"type": "decision", "text": "Criteria met?", "yes": "action1", "no": "q2"},
            "action1": {"type": "action", "text": "Immediate intervention", "urgency": "urgent"},
            "q2": {"type": "decision", "text": "Score >= 3?", "yes": "action2", "no": "action3"},
            "action2": {"type": "action", "text": "Admit ICU"},
            "action3": {"type": "action", "text": "Outpatient", "urgency": "routine"}
        },
        "start_node": "start"
    }
    """
    
    with open(json_file, 'r') as f:
        spec = json.load(f)
    
    tikz_code = generate_tikz_header()
    
    # Replace title
    title = spec.get('title', 'Clinical Decision Algorithm')
    tikz_code = tikz_code.replace('[TITLE TO BE SPECIFIED]', title)
    
    nodes = spec['nodes']
    start_node = spec.get('start_node', 'start')
    
    # Generate nodes (simplified layout - vertical)
    node_defs = []
    arrow_defs = []
    
    # Track positioning
    previous_node = None
    level = 0
    
    def add_node(node_id, position_rel=None):
        """Recursively add nodes."""
        
        if node_id not in nodes:
            return
        
        node = nodes[node_id]
        node_type = node['type']
        text = node['text']
        
        # Determine TikZ style
        if node_type == 'start' or node_type == 'end':
            style = 'startstop'
        elif node_type == 'decision':
            style = 'decision'
        elif node_type == 'action':
            urgency = node.get('urgency', 'normal')
            if urgency == 'urgent':
                style = 'urgent'
            elif urgency == 'routine':
                style = 'routine'
            else:
                style = 'process'
        else:
            style = 'process'
        
        # Position node
        if position_rel:
            node_def = f"\\node [{style}, {position_rel}] ({node_id}) {{{text}}};"
        else:
            node_def = f"\\node [{style}] ({node_id}) {{{text}}};"
        
        node_defs.append(node_def)
        
        # Add arrows for decision nodes
        if node_type == 'decision':
            yes_target = node.get('yes')
            no_target = node.get('no')
            
            if yes_target:
                # Determine arrow style based on target urgency
                target_node = nodes.get(yes_target, {})
                arrow_style = 'urgentarrow' if target_node.get('urgency') == 'urgent' else 'arrow'
                arrow_defs.append(f"\\draw [{arrow_style}] ({node_id}) -| node[near start, above] {{Yes}} ({yes_target});")
            
            if no_target:
                target_node = nodes.get(no_target, {})
                arrow_style = 'urgentarrow' if target_node.get('urgency') == 'urgent' else 'arrow'
                arrow_defs.append(f"\\draw [{arrow_style}] ({node_id}) -| node[near start, above] {{No}} ({no_target});")
    
    # Simple layout - just list nodes (manual positioning in JSON works better for complex trees)
    for node_id in nodes.keys():
        add_node(node_id)
    
    tikz_code += '\n'.join(node_defs) + '\n\n'
    tikz_code += '% Arrows\n'
    tikz_code += '\n'.join(arrow_defs) + '\n'
    
    tikz_code += generate_tikz_footer()
    
    # Save
    with open(output_file, 'w') as f:
        f.write(tikz_code)
    
    print(f"TikZ flowchart saved to: {output_file}")
    return tikz_code


def create_example_json():
    """Create example JSON specification for testing."""
    
    example = {
        "title": "Acute Chest Pain Management Algorithm",
        "nodes": {
            "start": {
                "type": "start",
                "text": "Patient with\\nchest pain"
            },
            "q1": {
                "type": "decision",
                "text": "STEMI\\ncriteria?",
                "yes": "stemi_action",
                "no": "q2"
            },
            "stemi_action": {
                "type": "action",
                "text": "Activate cath lab\\nAspirin, heparin\\nPrimary PCI",
                "urgency": "urgent"
            },
            "q2": {
                "type": "decision",
                "text": "High-risk\\nfeatures?",
                "yes": "admit",
                "no": "q3"
            },
            "admit": {
                "type": "action",
                "text": "Admit CCU\\nSerial troponins\\nEarly angiography"
            },
            "q3": {
                "type": "decision",
                "text": "TIMI\\nscore 0-1?",
                "yes": "lowrisk",
                "no": "moderate"
            },
            "lowrisk": {
                "type": "action",
                "text": "Observe 6-12h\\nStress test\\nOutpatient f/u",
                "urgency": "routine"
            },
            "moderate": {
                "type": "action",
                "text": "Admit telemetry\\nMedical management\\nRisk stratification"
            }
        },
        "start_node": "start"
    }
    
    return example


def main():
    parser = argparse.ArgumentParser(description='Build clinical decision tree flowcharts')
    parser.add_argument('-i', '--input', type=str, default=None,
                       help='Input file (JSON format)')
    parser.add_argument('-o', '--output', type=str, default='clinical_algorithm.tex',
                       help='Output .tex file')
    parser.add_argument('--example', action='store_true',
                       help='Generate example algorithm')
    parser.add_argument('--text', type=str, default=None,
                       help='Simple text algorithm (see format in docstring)')
    
    args = parser.parse_args()
    
    if args.example:
        print("Generating example algorithm...")
        example_spec = create_example_json()
        
        # Save example JSON
        with open('example_algorithm.json', 'w') as f:
            json.dump(example_spec, f, indent=2)
        print("Example JSON saved to: example_algorithm.json")
        
        # Generate TikZ from example
        json_to_tikz('example_algorithm.json', args.output)
    
    elif args.text:
        print("Generating algorithm from text...")
        simple_algorithm_to_tikz(args.text, args.output)
    
    elif args.input:
        print(f"Generating algorithm from {args.input}...")
        if args.input.endswith('.json'):
            json_to_tikz(args.input, args.output)
        else:
            with open(args.input, 'r') as f:
                text = f.read()
            simple_algorithm_to_tikz(text, args.output)
    
    else:
        print("No input provided. Use --example to generate example, --text for simple text, or -i for JSON input.")
        print("\nSimple text format:")
        print("START: Patient presentation")
        print("Q1: Criteria met? -> YES: Action (URGENT) | NO: Continue")
        print("Q2: Score >= 3? -> YES: Admit | NO: Outpatient (ROUTINE)")
        print("END: Follow-up")


if __name__ == '__main__':
    main()


# Example usage:
# python build_decision_tree.py --example
# python build_decision_tree.py -i algorithm_spec.json -o my_algorithm.tex
#
# Then compile:
# pdflatex clinical_algorithm.tex

