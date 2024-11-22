* When trying to instantiate with >= MAX_TOKENS in the `initialPrompts`, it crashes and never recovers.
    * No recovery is maybe a bug of the global scheduler (always retrying)
* English detection sometimes does not work. This can be worked around by forcing "boilerplate english" at the beginning of each response.
    * If I expect the AI to always answer `I propose this name: <NAME HERE>` instead of `<NAME HERE>`, it works 10/10.
