import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const parentPath = context.parentURL?.startsWith("file:")
      ? fileURLToPath(context.parentURL)
      : "";
    const isProjectFile =
      parentPath.length > 0 &&
      !parentPath.includes(`${path.sep}node_modules${path.sep}`);

    if (
      isProjectFile &&
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      path.extname(specifier) === ""
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }

    return nextResolve(specifier, context);
  },
});
