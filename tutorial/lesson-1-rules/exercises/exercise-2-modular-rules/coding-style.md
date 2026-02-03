# Coding Style Rules

## Python
- Follow PEP 8
- Use type hints on all function signatures
- Maximum line length: 88 characters (Black formatter)
- Use `pathlib.Path` instead of `os.path`
- Prefer f-strings over `.format()` or `%` formatting

## File Organization
- One class per file for models and services
- Group imports: stdlib, third-party, local (enforced by isort)
- Keep files under 300 lines; split if longer

## Naming Conventions
- Functions/variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_leading_underscore`
- Test functions: `test_<what>_<condition>_<expected>`

## Documentation
- All public functions need a one-line docstring at minimum
- Complex business logic needs inline comments explaining "why"
- Module-level docstrings for files with non-obvious purpose
