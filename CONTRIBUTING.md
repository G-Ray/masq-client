# Contributing to MasqClient

Details for developers about contributing to the MasqClient code.


Whether you're working on a bug fix or a new feature, remember to first open an issue and to document the current (missing) behaviour. Work will be done in a branch name that uses the same issue number as the one previously opened. For example, if you have just created `issue-123`, then you can check out a new branch with the same name: `git checkout -b issue-123`. Finally, you must **always** submit your PR together with the corresponding tests. Untested code will not even be reviewed.


## Commit Messages

* Use present tense, so it's read as: If you applied this changeset, X happens.
* Start with a capital letter; use proper capitalization throughout, end with a period.
* Keep the first message under 50 chars if possible, (certainly under 80). It should express a basic summary of the changeset. Be specific, don't just say "Fix the bug."
* If you have more to express after the summary, leave an empty line after the opening summary and then express whatever you need in an extended description.
* If you need to reference issues, then after the optional extended description, leave an empty line and then use `Addresses #issue-number` (for example).

Example commit messages:

```
Switch to ES6 declarations.

- Replaces existing function declarations with an fat arrows.

Addresses #123.
```

## Code Style

### StandardJS

Follow these rules as strictly as possible; only stray if there's a Very Good
Reason To (TM).

* Use ES6 syntax
* 2 spaces – for indentation
* Single quotes for strings – except to avoid escaping
* No unused variables – this one catches *tons* of bugs!
* No semicolons – It's fine. [Really!](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding)
* Never start a line with (, [, or ` as this is the only gotcha with omitting semicolons – automatically checked for you! [more details](https://standardjs.com/rules-en.html#semicolons)
* Space after keywords `if (condition) { ... }`
* Space after function name `function name (arg) { ... }`
* Always use === instead of == – but obj == null is allowed to check `null || undefined`.
* Always handle the node.js *err* function parameter
* Always prefix browser globals with *window* – except *document* and *navigator* are okay. This prevents accidental use of poorly-named browser globals like *open*, *length*, *event*, and *name*
* ...
* [Complete list of rules](https://standardjs.com/rules-en.html#javascript-standard-style)


#### Linter

Most style and code rules can be checked with the [standardjs](https://standardjs.com/) linter. This script runs by default when building the project.

    $ npm run lint

