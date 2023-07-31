const fs = require("fs");
const yaml = require("js-yaml");
const { program } = require("commander");

program
  .name("yaml-alphabetize")
  .description("CLI to alphabetize a section of YAML")
  .version("0.0.1");

program.argument("<file>", "input file name");
program.argument("<path>", "path to the object to alphabetize");
program.option("-o, --output <output>", "output file name");
program.option("-v, --verbose", "verbose output");

program.parse();

try {
  const { output, verbose } = program.opts();

  const fileName = program.args[0];
  const path = program.args[1];

  if (!fileName) {
    console.error(
      "Please provide a file name. Example: npx yaml-alphabetize input.yaml components/schemas"
    );
    process.exit(1);
  }

  if (!path) {
    console.error(
      "Please provide a path. Example: npx yaml-alphabetize input.yaml components/schemas"
    );
    process.exit(1);
  }

  if (verbose) {
    console.debug("Alphabetizing " + path + " in " + fileName);
  }

  let fileContents = fs.readFileSync(fileName, "utf8");
  if (!fileContents) {
    console.error("File not found");
    process.exit(1);
  }
  let data = yaml.load(fileContents);
  if (!data) {
    console.error("File unable to be parsed as yaml");
    process.exit(1);
  }

  let pathParts = path.split("/");
  let schemas = data;
  for (let i = 0; i < pathParts.length; i++) {
    let pathPart = pathParts[i];
    schemas = schemas[pathPart];
    if (!data) {
      console.error("Path not found in yaml");
      process.exit(1);
    }
  }

  if (!schemas) {
    console.error("Path not found in yaml");
    process.exit(1);
  }
  let sortedSchemas = {};
  Object.keys(schemas)
    .sort()
    .forEach(function (key) {
      sortedSchemas[key] = schemas[key];
    });

  // Update data with sorted schemas of deep path
  let current = data;
  for (let i = 0; i < pathParts.length; i++) {
    let pathPart = pathParts[i];
    if (i === pathParts.length - 1) {
      current[pathPart] = sortedSchemas;
    } else {
      current = current[pathPart];
    }
  }

  let yamlStr = yaml.dump(data);
  if (output) {
    if (verbose) {
      console.log("Writing to " + output);
    }
    fs.writeFileSync(output, yamlStr, "utf8");
  } else {
    if (verbose) {
      console.log("Writing to stdout");
    }
    console.log(yamlStr);
  }
  if (verbose) {
    console.debug("Done!");
  }
} catch (e) {
  console.error(e);
}
