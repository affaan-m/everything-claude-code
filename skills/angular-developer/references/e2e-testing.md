# End-to-End (E2E) Testing

This project uses [Cypress](https://www.cypress.io/) for end-to-end (E2E) testing, which simulates real user interactions in a browser. The E2E tests are located primarily within the `devtools/` package.

## Running E2E Tests

The primary way to run E2E tests is through the `pnpm` script defined in the root `package.json`.

1.  **Build DevTools:** The E2E tests run against a built version of the devtools extension. You must build it first:

    ```shell
    pnpm -F ng-devtools-mcp build:dev
    ```

2.  **Run Cypress:** Use the `cy:open` or `cy:run` script:
    - To open the interactive Cypress Test Runner:
      ```shell
      pnpm -F ng-devtools-mcp cy:open
      ```
    - To run the tests headlessly in the terminal (ideal for CI):
      ```shell
      pnpm -F ng-devtools-mcp cy:run
      ```

## Test Structure

- **Configuration:** The main Cypress configuration is located at `devtools/cypress.json`.
- **Specs:** Test files (specs) are located in `devtools/cypress/integration/`.
- **Custom Commands:** Reusable custom commands and actions are defined in `devtools/cypress/support/`.

### Example E2E Test Snippet

A typical test might look like this:

```typescript
// in devtools/cypress/integration/profiler.spec.ts

describe('Profiler', () => {
  beforeEach(() => {
    cy.visit('/?e2e-app');
    cy.wait(1000);
    cy.get('ng-devtools-tabs').find('a').contains('Profiler').click();
  });

  it('should record and display profiling data', () => {
    // Find the record button and click it
    cy.get('button[aria-label="start-recording-button"]').click();

    // Interact with the test application to generate profiling data
    cy.get('body').find('#cards button').first().click();
    cy.wait(500);

    // Stop recording
    cy.get('button[aria-label="stop-recording-button"]').click();

    // Assert that the flame graph is now visible
    cy.get('ng-devtools-recording-timeline').find('canvas').should('be.visible');
  });
});
```

### Best Practices

- **Use `data-` attributes:** Whenever possible, use `data-cy` or similar attributes for selecting elements to make tests more resilient to CSS or structural changes.
- **Custom Commands:** Encapsulate common sequences of actions into custom commands in the `support` directory to keep tests clean and readable.
- **Wait for Application State:** Use `cy.wait()` for arbitrary waits sparingly. Prefer to wait for specific UI elements to appear or for network requests to complete to avoid flaky tests.
