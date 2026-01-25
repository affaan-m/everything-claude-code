# EARS Format Guidelines

## Overview
EARS (Easy Approach to Requirements Syntax) is the standard format for acceptance criteria in spec-driven development.

EARS patterns describe the logical structure of a requirement (condition + subject + response) and are not tied to any particular natural language.  
All acceptance criteria should be written in the target language configured for the specification (for example, `spec.json.language` / `ja`).  
Keep EARS trigger keywords and fixed phrases in English (`When`, `If`, `While`, `Where`, `The system shall`, `The [system] shall`) and localize only the variable parts (`[event]`, `[precondition]`, `[trigger]`, `[feature is included]`, `[response/action]`) into the target language. Do not interleave target-language text inside the trigger or fixed English phrases themselves.

## Primary EARS Patterns

### 1. Event-Driven Requirements
- **Pattern**: When [event], the [system] shall [response/action]
- **Use Case**: Responses to specific events or triggers
- **Example**: When user clicks checkout button, the Checkout Service shall validate cart contents

### 2. State-Driven Requirements
- **Pattern**: While [precondition], the [system] shall [response/action]
- **Use Case**: Behavior dependent on system state or preconditions
- **Example**: While payment is processing, the Checkout Service shall display loading indicator

### 3. Unwanted Behavior Requirements
- **Pattern**: If [trigger], the [system] shall [response/action]
- **Use Case**: System response to errors, failures, or undesired situations
- **Example**: If invalid credit card number is entered, then the website shall display error message

### 4. Optional Feature Requirements
- **Pattern**: Where [feature is included], the [system] shall [response/action]
- **Use Case**: Requirements for optional or conditional features
- **Example**: Where the car has a sunroof, the car shall have a sunroof control panel

### 5. Ubiquitous Requirements
- **Pattern**: The [system] shall [response/action]
- **Use Case**: Always-active requirements and fundamental system properties
- **Example**: The mobile phone shall have a mass of less than 100 grams

## Combined Patterns
- While [precondition], when [event], the [system] shall [response/action]
- When [event] and [additional condition], the [system] shall [response/action]

## Subject Selection Guidelines
- **Software Projects**: Use concrete system/service name (e.g., "Checkout Service", "User Auth Module")
- **Process/Workflow**: Use responsible team/role (e.g., "Support Team", "Review Process")
- **Non-Software**: Use appropriate subject (e.g., "Marketing Campaign", "Documentation")

## Quality Criteria
- Requirements must be testable, verifiable, and describe a single behavior.
- Use objective language: "shall" for mandatory behavior, "should" for recommendations; avoid ambiguous terms.
- Follow EARS syntax: [condition], the [system] shall [response/action].
