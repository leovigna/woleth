//WARNING: Editing this requires removing the pnpm-lock.yaml and running `pnpm run clean:node_modules` beforehand
module.exports = {
  hooks: {
    readPackage(pkg, context) {
      /***** DEPENDENCIES ONLY *****/
      //Drop dependencies, uneeded or overriden globally
      const depsDrop = [
        // "winston",
        //If a dependency has a higher react version, it should work but we skip it here so that it works with pnpm
        "react",
        "react-dom",
        "@types/react",
        "@types/react-dom",
      ];

      if (!pkg.name?.startsWith("@leovigna")) {
        //const removable = dropExceptions(deps, exceptions[pkg.name]);
        depsDrop.forEach((p) => delete pkg.dependencies[p]);
        depsDrop.forEach((p) => delete pkg.devDependencies[p]);
        depsDrop.forEach((p) => delete pkg.peerDependencies[p]);
      }

      return pkg;
    },
    afterAllResolved(lockfile) {
      return lockfile;
    },
  },
};
