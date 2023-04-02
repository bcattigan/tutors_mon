import chalk from "chalk";
import * as fs from "fs";
import yaml from "js-yaml";
import path from "path";

export function writeFile(folder: string, filename: string, contents: string): void {
  const outputPath = path.join(folder, filename);
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(outputPath, contents);
  } catch (err) {
    errorHandling("writeFile", err);
  }
}

export function findFirstMatchingString(strings: string[], search: string): string {
  let firstMatchingString = "unknown";
  try {
    for (const str of strings) {
      if (search.includes(str)) {
        firstMatchingString = str.slice(1);
        return firstMatchingString;
      }
    }
  } catch (err) {
    errorHandling("findFirstMatchingString", err);
  }
  return firstMatchingString;
}

export function getFileName(filePath: string): string {
  let fileName = "";
  try {
    fileName = path.basename(filePath);
  } catch (err) {
    errorHandling("getFileName", err);
  }
  return fileName;
}

export function getFileType(fileName: string): string {
  let fileType = "";
  try {
    fileType = path.extname(fileName);
  } catch (err) {
    errorHandling("getFileType", err);
  }
  return fileType;
}

export function readWholeFile(path: string): string {
  let wholeFile = "";
  try {
    if (fs.existsSync(path)) {
      wholeFile = fs.readFileSync(path).toString();
    } else {
      errorHandling("readWholeFile", `unable to locate: ${path}`);
    }
  } catch (err) {
    errorHandling("readWholeFile", err);
  }
  return wholeFile;
}

export function readFirstLineFromFile(path: string): string {
  let firstLine = "";
  try {
    if (fs.existsSync(path)) {
      const array = fs.readFileSync(path).toString().split("\n");
      firstLine = array[0].replace("\r", "");
    } else {
      errorHandling("readFirstLineFromFile", `unable to locate: ${path}`);
    }
  } catch (err) {
    errorHandling("readFirstLineFromFile", err);
  }
  return firstLine;
}

export function getHeaderFromBody(body: string): string {
  let header = "";
  try {
    const array = body.split("\n");
    if (array[0][0] === "#") {
      header = array[0].substring(1);
    } else {
      header = array[0];
    }
  } catch (err) {
    errorHandling("getHeaderFromBody", err);
  }
  return header;
}

export function withoutHeaderFromBody(body: string): string {
  let content = body;
  try {
    const line1 = content.indexOf("\n");
    content = content.substring(line1 + 1, content.length);
    content = content.trim();
    const line2 = content.indexOf("\n");
    if (line2 > -1) {
      content = content.substring(0, line2);
    }
  } catch (err) {
    errorHandling("withoutHeaderFromBody", err);
  }
  return content;
}

export function copyFile(file: string, destFolder: string): void {
  try {
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    const outputFilePath = path.join(destFolder, path.basename(file));
    fs.copyFileSync(file, outputFilePath);
  } catch (err) {
    errorHandling("copyFile", err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readYamlFile(yamlFilePath: string): any {
  let yamlData = null;
  try {
    yamlData = yaml.load(fs.readFileSync(yamlFilePath, "utf8"));
  } catch (err) {
    errorHandling("readYamlFile", err);
  }
  return yamlData;
}

export function copyTemplateFile(template: string, destFolder: string): void {
  let nodePath = path.dirname(process.argv[1]);
  if (require.main) {
    nodePath = path.dirname(require.main.filename);
  }
  const file = path.join(nodePath, "tutors-gen", "templates", template);
  try {
    copyFile(file, destFolder);
  } catch (err) {
    errorHandling("copyTemplateFile", err);
  }
}

export function errorHandling(func: string, err: unknown): void {
  console.log(chalk.red(`Issue found (function: ${func}): ${err}`));
  console.log(chalk.blue("Watching commencing..."));
}
