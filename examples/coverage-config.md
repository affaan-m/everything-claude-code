# Test Coverage Configuration Examples

Cross-language coverage setup guide for achieving 80%+ coverage.

## Jest (TypeScript/JavaScript)

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
}
```

```bash
npm test -- --coverage
```

## pytest-cov (Python)

```toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-report=term-missing --cov-report=html --cov-fail-under=80"

[tool.coverage.run]
source = ["app"]
omit = ["*/tests/*", "*/migrations/*", "*/__pycache__/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
```

```bash
pytest --cov=app --cov-report=html
```

## go test -cover (Go)

```bash
# Basic coverage
go test -cover ./...

# With HTML report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# With minimum threshold
go test -coverprofile=coverage.out ./... && \
  COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | tr -d '%') && \
  echo "Coverage: $COVERAGE%" && \
  awk "BEGIN {exit ($COVERAGE < 80)}"
```

## JaCoCo (Java)

### Gradle

```kotlin
// build.gradle.kts
plugins {
    jacoco
}

jacoco {
    toolVersion = "0.8.11"
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required = true
        html.required = true
    }
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = "0.80".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}
```

### Maven

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <execution>
            <id>check</id>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

## cargo-tarpaulin (Rust)

```toml
# tarpaulin.toml
[report]
out = ["html", "lcov"]
output-dir = "coverage"

[config]
fail-under = 80
exclude-files = ["tests/*", "benches/*", "examples/*"]
```

```bash
cargo tarpaulin --out html --fail-under 80
```

## GitHub Actions Coverage Workflow

```yaml
name: Coverage
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Node.js
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage

      # Upload to Codecov
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Codecov Configuration

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 2%
    patch:
      default:
        target: 80%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: false
```

## Quick Reference

| Language | Tool | Command | Config |
|----------|------|---------|--------|
| TypeScript | Jest | `npm test -- --coverage` | jest.config.ts |
| Python | pytest-cov | `pytest --cov=app` | pyproject.toml |
| Go | go test | `go test -cover ./...` | - |
| Java | JaCoCo | `./gradlew jacocoTestReport` | build.gradle.kts |
| Rust | tarpaulin | `cargo tarpaulin` | tarpaulin.toml |
