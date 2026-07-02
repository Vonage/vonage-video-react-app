# Testing

## Integration Tests

We have integration tests using [Playwright](https://playwright.dev/). We recommend using their [VSCode integration](https://playwright.dev/docs/getting-started-vscode) to run tests.

To run the tests you need to run the app server separately (see [Getting Started](./GETTING_STARTED.md) for server setup details):

```console
# In one terminal tab
yarn start

# In a separate tab. Or use vscode extension to run tests
yarn test:integration
```

### Screenshot tests or Visual comparisons

We use [Playwright Visual Comparison](https://playwright.dev/docs/test-snapshots) for Screenshot UI tests. Since screenshot tests are part of our integration tests, running our integration tests also executes the screenshot tests.

### Generating and Updating Screenshots

If we need to update the expected screenshot due to UI changes, we can delete the existing expected screenshot and then run the test. The test will fail, but a new expected screenshot will be generated. Running the test again should pass, as the expected and actual screenshots will now match.

For CI tests, we require screenshots for various browsers and operating systems because they [render interfaces with subtle differences](https://github.com/microsoft/playwright/issues/18240#issuecomment-1287546463).

To capture CI-specific screenshots, you can use the `update-screenshots` job. This job is triggered by creating a pull request (PR) with the `update-screenshots` label on GitHub. Once triggered, it will capture new screenshots on the virtual machine (VM) and automatically push those to the PR's branch.

## Running the backend and frontend test suites

- To run the frontend and backend tests:
```console
yarn test
```

## Backend Suite

- To run backend tests once:

```console
yarn test:backend
```

- For additional CLI options, see [jest docs](https://jestjs.io/docs/cli).

## Frontend Suite

We have frontend tests using [vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). We recommend using the [vitest VSCode integration](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) to run tests.

For guidance on writing unit tests, see the [Test Instructions](../.github/instructions/test-files.instructions.md).

Alternatively you can run the tests in the terminal:
- To run frontend tests once:

```console
yarn test:frontend
```

- For additional CLI options, see [vitest docs](https://vitest.dev/guide/cli#options).
