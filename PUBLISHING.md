# Publishing Guide

## Building the Package

Before publishing, build the package:

```bash
npm run build
```

This will create the `dist/` folder with compiled JavaScript and TypeScript definitions.

## Publishing to npm

1. **Login to npm** (if not already logged in):
   ```bash
   npm login
   ```

2. **Update version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

   Or publish with public access:
   ```bash
   npm publish --access public
   ```

## Testing Locally

Before publishing, you can test the package locally:

1. **Link the package**:
   ```bash
   npm link
   ```

2. **In your test project**, link to the local package:
   ```bash
   npm link qrcode-pro
   ```

3. **Or use file path** in your test project's `package.json`:
   ```json
   {
     "dependencies": {
       "qrcode-pro": "file:../qrcode-pro"
     }
   }
   ```

## Example Project Setup

To test the package in the example React project:

1. **Install dependencies** in the root:
   ```bash
   npm install
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Navigate to example**:
   ```bash
   cd example
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run the dev server**:
   ```bash
   npm run dev
   ```

The example project uses a file path reference to the parent package, so changes to the package will be reflected after rebuilding.

