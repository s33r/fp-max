# Workflow

When working on a request follow this process:
- Complete the request
- Commit
- Push

# Project Organization.

There are two kinds of components:
1. **Library** Components are located in the `src/components` directory. They provide the user interface for the project.
2. **Utility** Components are located in the `src/helpers` directory. They used for testing and starting up the project.

Each component must have its own directory. When creating a new component ensure that it has:
1. a `readme.md` file that describes the purpose of the component
2. a `index.tsx` file that has the react component itself.
3. a `index.scss` file that has the styles for the component.
