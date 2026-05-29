# Contributing to Vonage Video React App

## Welcome to Contributors
Thank you for your interest in contributing to our open source reference application! We're excited to have you join our community and help improve this project.

## Before you start — what gets accepted
To set expectations clearly, contributions are accepted when they:
- Address a discussed and approved issue for anything beyond a bug fix
- Are scoped small, with one concern per PR, split across multiple PRs if the feature is large
- Pass CI checks: tests, coverage on new code, and complexity thresholds
- Are architecturally coherent with the existing codebase
- Come from a contributor who can explain and maintain what they submitted

Contributions are declined or returned when they arrive as large undiscussed diffs, skip the issue-first step, bundle multiple unrelated changes, or cannot be explained by the contributor.

## Getting Started
Before you begin, please review the following:
- Read our [Code of Conduct](../CODE_OF_CONDUCT.md) to understand our community standards.
- Check the [README.md](../README.md) for an overview of the project and setup instructions.
- Browse the [open issues](https://github.com/Vonage/vonage-video-react-app/issues) to see what needs attention.

## Contributing

### Opening an Issue — Bug Reports or Feature Requests
We always welcome feedback. If you've seen something that isn't quite right or you have a suggestion for a new feature, please go ahead and open an issue. Select the appropriate template and include as much information as you have. It really helps.

When opening an issue for a feature request or non-trivial change, please include:
- Problem: What are you trying to solve?
- Proposed solution: How do you plan to approach it?
- Alternatives considered: What other options did you evaluate and why did you rule them out?
- Architectural impact: Does this affect existing layers, patterns, or contracts in the codebase?

### Making a Code Change
Pull requests submitted without a linked issue or prior discussion may be labeled as Proof of Concept (PoC) and held until the proposal has been discussed and prioritized with the product team.

PRs should be kept small and focused. Only minor bug fixes submitted without prior discussion are likely to be considered for review.

When you're ready to start coding, fork this repository to your own GitHub account and make your changes in a new branch based on `develop`. Once you're happy, open a pull request to merge into `develop` and explain what the change is and why you think we should include it.

#### Pull Request Checklist
Before marking your PR as ready for review, please verify:
- [ ] A linked issue exists and has been discussed
- [ ] The change is scoped as small as reasonably possible
- [ ] New or updated logic is covered by tests
- [ ] No new dependencies have been introduced without prior discussion
- [ ] You can explain the change and are prepared to maintain it going forward

#### Review Expectations by PR Size
We apply different levels of scrutiny depending on scope:

| PR type | Criteria | Review process |
| --- | --- | --- |
| Small / focused | Single concern, one layer affected, minimal diff | Lightweight review, 1 approval |
| Large / cross-cutting | Multiple layers, significant new logic, new dependencies | In-depth review required; design discussion in the issue beforehand is strongly recommended |

If you're unsure which category your PR falls into, err on the side of opening an issue first.

#### Splitting large features into smaller PRs
Features that span multiple layers or require significant new logic must be broken down into a sequence of small, independently reviewable PRs. Each PR in the sequence should:
- Represent a single coherent unit of work: a layer, a component, or a well-defined step
- Be understandable on its own, without the reviewer needing the full feature context
- Reference the parent issue and indicate its position in the sequence, for example `[1/3] Add data model` or `[2/3] Add service layer`

A PR that bundles an entire feature in a single large diff will be returned with a request to split it, regardless of code quality. If you're unsure how to break a feature down, propose the sequence in the issue. Maintainers will help before you write any code.

#### How we think about task and PR decomposition
When splitting a feature, apply these principles:
- Verb + noun naming. Every PR title should describe the work, not the intent.
	- `Implement password reset API endpoint`
	- `Add email confirmation screen`
	- Avoid vague titles such as `Work on login` or `Backend stuff`
- Vertical slicing over layer slicing. Prefer PRs that deliver a working slice of behavior end to end, rather than PRs that own an entire technical layer.
	- `Fetch user profile data from API`, then `Display user profile data in UI`
	- Avoid `Do all the frontend` or `Do all the backend`
- Sizing. Each PR should represent roughly 4 to 16 hours of work. If a PR would likely take longer than two days, split it further.
- Cover all work types. A feature is not done when the code is done. Consider whether your sequence of PRs includes design, development, testing, and documentation when relevant.
- Current scope only. Break down the story at hand. Do not speculate or plan ahead for future iterations in the same PR sequence.

### Responsibility and AI-Assisted Contributions
You are welcome to use AI coding tools such as Copilot, Cursor, or Claude to help write code. However, the contributor is responsible for understanding and being able to explain every line of code submitted, regardless of how it was generated.

Once a contribution is merged, ongoing maintenance of that code becomes the responsibility of the project maintainers. This is precisely why we hold contributions to a high standard: we need to be confident we can own, extend, and debug what gets merged.

This means:
- Do not submit code you cannot explain or defend in a review
- AI-generated code is held to the same quality and architectural standards as hand-written code
- Reviewers may ask questions about any part of a PR; not being the original author is not an accepted reason for not knowing the answer

This is not a policy against AI tools. It is a policy for contributor accountability.

### Pull Request Activity and Abandonment
Please keep your pull request active once opened. If maintainers request changes, clarification, or additional context, respond within a reasonable time and keep the discussion moving.

We may close pull requests that appear abandoned, especially when they have unresolved review feedback, failing checks, or no contributor response for an extended period. Closed pull requests can be reopened later when the contributor is ready to continue and the branch is brought back into a reviewable state.

### Branching
Our `main` branch is the evergreen source of truth for the Vonage Video React Reference App. All new development should be done in the `develop` branch. Contributions should be made by branching off `develop`, and pull requests should be submitted against `develop`. Periodically, `develop` will be merged into `main` as a batch.

Internally, we use Jira for issue tracking. Internal branches use the format `DEVELOPERNAME/TICKETNUMBER-SHORTDESCRIPTION`, for example `alicesmith/VIDCS-123-fix-broken-icon`. If you'd like to contribute a pull request from your fork, please use a descriptive branch name, for example `fix-broken-icon`.

Release versions use the format `rc-RELEASENUMBER`, for example `rc-1.0.0`. We follow [Semantic Versioning](https://semver.org/).
