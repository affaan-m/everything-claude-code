# Prompt Template Systems

## Template Architecture

### Basic Template Structure

```python
class PromptTemplate:
    def __init__(self, template_string, variables=None):
        self.template = template_string
        self.variables = variables or []

    def render(self, **kwargs):
        missing = set(self.variables) - set(kwargs.keys())
        if missing:
            raise ValueError(f"Missing required variables: {missing}")

        return self.template.format(**kwargs)

# Usage
template = PromptTemplate(
    template_string="Translate {text} from {source_lang} to {target_lang}",
    variables=['text', 'source_lang', 'target_lang']
)

prompt = template.render(
    text="Hello world",
    source_lang="English",
    target_lang="Spanish"
)
```

### Conditional Templates

```python
class ConditionalTemplate(PromptTemplate):
    def render(self, **kwargs):
        # Process conditional blocks
        result = self.template

        # Handle if-blocks: {{#if variable}}content{{/if}}
        import re
        if_pattern = r'\{\{#if (\w+)\}\}(.*?)\{\{/if\}\}'

        def replace_if(match):
            var_name = match.group(1)
            content = match.group(2)
            return content if kwargs.get(var_name) else ''

        result = re.sub(if_pattern, replace_if, result, flags=re.DOTALL)

        # Handle for-loops: {{#each items}}{{this}}{{/each}}
        each_pattern = r'\{\{#each (\w+)\}\}(.*?)\{\{/each\}\}'

        def replace_each(match):
            var_name = match.group(1)
            content = match.group(2)
            items = kwargs.get(var_name, [])
            return '\\n'.join(content.replace('{{this}}', str(item)) for item in items)

        result = re.sub(each_pattern, replace_each, result, flags=re.DOTALL)

        # Finally, render remaining variables
        return result.format(**kwargs)

# Usage
template = ConditionalTemplate("""
Analyze the following text:
{text}

{{#if include_sentiment}}
Provide sentiment analysis.
{{/if}}

{{#if include_entities}}
Extract named entities.
{{/if}}

{{#if examples}}
Reference examples:
{{#each examples}}
- {{this}}
{{/each}}
{{/if}}
""")
```

### Modular Template Composition

```python
class ModularTemplate:
    def __init__(self):
        self.components = {}

    def register_component(self, name, template):
        self.components[name] = template

    def render(self, structure, **kwargs):
        parts = []
        for component_name in structure:
            if component_name in self.components:
                component = self.components[component_name]
                parts.append(component.format(**kwargs))

        return '\\n\\n'.join(parts)

# Usage
builder = ModularTemplate()

builder.register_component('system', "You are a {role}.")
builder.register_component('context', "Context: {context}")
builder.register_component('instruction', "Task: {task}")
builder.register_component('examples', "Examples:\\n{examples}")
builder.register_component('input', "Input: {input}")
builder.register_component('format', "Output format: {format}")

# Compose different templates for different scenarios
basic_prompt = builder.render(
    ['system', 'instruction', 'input'],
    role='helpful assistant',
    instruction='Summarize the text',
    input='...'
)

advanced_prompt = builder.render(
    ['system', 'context', 'examples', 'instruction', 'input', 'format'],
    role='expert analyst',
    context='Financial analysis',
    examples='...',
    instruction='Analyze sentiment',
    input='...',
    format='JSON'
)
```

## Common Template Patterns

### Classification Template

```python
CLASSIFICATION_TEMPLATE = """
Classify the following {content_type} into one of these categories: {categories}

{{#if description}}
Category descriptions:
{description}
{{/if}}

{{#if examples}}
Examples:
{examples}
{{/if}}

{content_type}: {input}

Category:"""
```

### Extraction Template

```python
EXTRACTION_TEMPLATE = """
Extract structured information from the {content_type}.

Required fields:
{field_definitions}

{{#if examples}}
Example extraction:
{examples}
{{/if}}

{content_type}: {input}

Extracted information (JSON):"""
```

### Generation Template

```python
GENERATION_TEMPLATE = """
Generate {output_type} based on the following {input_type}.

Requirements:
{requirements}

{{#if style}}
Style: {style}
{{/if}}

{{#if constraints}}
Constraints:
{constraints}
{{/if}}

{{#if examples}}
Examples:
{examples}
{{/if}}

{input_type}: {input}

{output_type}:"""
```

### Transformation Template

```python
TRANSFORMATION_TEMPLATE = """
Transform the input {source_format} to {target_format}.

Transformation rules:
{rules}

{{#if examples}}
Example transformations:
{examples}
{{/if}}

Input {source_format}:
{input}

Output {target_format}:"""
```

## Advanced Features

### Template Inheritance

```python
class TemplateRegistry:
    def __init__(self):
        self.templates = {}

    def register(self, name, template, parent=None):
        if parent and parent in self.templates:
            # Inherit from parent
            base = self.templates[parent]
            template = self.merge_templates(base, template)

        self.templates[name] = template

    def merge_templates(self, parent, child):
        # Child overwrites parent sections
        return {**parent, **child}

# Usage
registry = TemplateRegistry()

registry.register('base_analysis', {
    'system': 'You are an expert analyst.',
    'format': 'Provide analysis in structured format.'
})

registry.register('sentiment_analysis', {
    'instruction': 'Analyze sentiment',
    'format': 'Provide sentiment score from -1 to 1.'
}, parent='base_analysis')
```

### Variable Validation

```python
class ValidatedTemplate:
    def __init__(self, template, schema):
        self.template = template
        self.schema = schema

    def validate_vars(self, **kwargs):
        for var_name, var_schema in self.schema.items():
            if var_name in kwargs:
                value = kwargs[var_name]

                # Type validation
                if 'type' in var_schema:
                    expected_type = var_schema['type']
                    if not isinstance(value, expected_type):
                        raise TypeError(f"{var_name} must be {expected_type}")

                # Range validation
                if 'min' in var_schema and value < var_schema['min']:
                    raise ValueError(f"{var_name} must be >= {var_schema['min']}")

                if 'max' in var_schema and value > var_schema['max']:
                    raise ValueError(f"{var_name} must be <= {var_schema['max']}")

                # Enum validation
                if 'choices' in var_schema and value not in var_schema['choices']:
                    raise ValueError(f"{var_name} must be one of {var_schema['choices']}")

    def render(self, **kwargs):
        self.validate_vars(**kwargs)
        return self.template.format(**kwargs)

# Usage
template = ValidatedTemplate(
    template="Summarize in {length} words with {tone} tone",
    schema={
        'length': {'type': int, 'min': 10, 'max': 500},
        'tone': {'type': str, 'choices': ['formal', 'casual', 'technical']}
    }
)
```

### Template Caching

```python
class CachedTemplate:
    def __init__(self, template):
        self.template = template
        self.cache = {}

    def render(self, use_cache=True, **kwargs):
        if use_cache:
            cache_key = self.get_cache_key(kwargs)
            if cache_key in self.cache:
                return self.cache[cache_key]

        result = self.template.format(**kwargs)

        if use_cache:
            self.cache[cache_key] = result

        return result

    def get_cache_key(self, kwargs):
        return hash(frozenset(kwargs.items()))

    def clear_cache(self):
        self.cache = {}
```

## Multi-Turn Templates

### Conversation Template

```python
class ConversationTemplate:
    def __init__(self, system_prompt):
        self.system_prompt = system_prompt
        self.history = []

    def add_user_message(self, message):
        self.history.append({'role': 'user', 'content': message})

    def add_assistant_message(self, message):
        self.history.append({'role': 'assistant', 'content': message})

    def render_for_api(self):
        messages = [{'role': 'system', 'content': self.system_prompt}]
        messages.extend(self.history)
        return messages

    def render_as_text(self):
        result = f"System: {self.system_prompt}\\n\\n"
        for msg in self.history:
            role = msg['role'].capitalize()
            result += f"{role}: {msg['content']}\\n\\n"
        return result
```

### State-Based Templates

```python
class StatefulTemplate:
    def __init__(self):
        self.state = {}
        self.templates = {}

    def set_state(self, **kwargs):
        self.state.update(kwargs)

    def register_state_template(self, state_name, template):
        self.templates[state_name] = template

    def render(self):
        current_state = self.state.get('current_state', 'default')
        template = self.templates.get(current_state)

        if not template:
            raise ValueError(f"No template for state: {current_state}")

        return template.format(**self.state)

# Usage for multi-step workflows
workflow = StatefulTemplate()

workflow.register_state_template('init', """
Welcome! Let's {task}.
What is your {first_input}?
""")

workflow.register_state_template('processing', """
Thanks! Processing {first_input}.
Now, what is your {second_input}?
""")

workflow.register_state_template('complete', """
Great! Based on:
- {first_input}
- {second_input}

Here's the result: {result}
""")
```

## Best Practices

1. **Keep It DRY**: Use templates to avoid repetition
2. **Validate Early**: Check variables before rendering
3. **Version Templates**: Track changes like code
4. **Test Variations**: Ensure templates work with diverse inputs
5. **Document Variables**: Clearly specify required/optional variables
6. **Use Type Hints**: Make variable types explicit
7. **Provide Defaults**: Set sensible default values where appropriate
8. **Cache Wisely**: Cache static templates, not dynamic ones

## Template Libraries

### Question Answering

```python
QA_TEMPLATES = {
    'factual': """Answer the question based on the context.

Context: {context}
Question: {question}
Answer:""",

    'multi_hop': """Answer the question by reasoning across multiple facts.

Facts: {facts}
Question: {question}

Reasoning:""",

    'conversational': """Continue the conversation naturally.

Previous conversation:
{history}

User: {question}
Assistant:"""
}
```

### Content Generation

```python
GENERATION_TEMPLATES = {
    'blog_post': """Write a blog post about {topic}.

Requirements:
- Length: {word_count} words
- Tone: {tone}
- Include: {key_points}

Blog post:""",

    'product_description': """Write a product description for {product}.

Features: {features}
Benefits: {benefits}
Target audience: {audience}

Description:""",

    'email': """Write a {type} email.

To: {recipient}
Context: {context}
Key points: {key_points}

Email:"""
}
```

## Performance Considerations

- Pre-compile templates for repeated use
- Cache rendered templates when variables are static
- Minimize string concatenation in loops
- Use efficient string formatting (f-strings, .format())
- Profile template rendering for bottlenecks
