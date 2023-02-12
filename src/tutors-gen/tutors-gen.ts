import * as fs from "fs";
import path from "path";
import chalk from "chalk";
import { courseBuilder } from "./builders/course-builder";
import { resourceBuilder } from "./builders/resource-builder";
import { copyTemplateFile, errorHandling } from "./utils/utils";

export function generate(): void {
  if (fs.existsSync("course.md")) {
    const currentDir = process.cwd();
    const destFolder = path.join(currentDir, "json");
    try {
      resourceBuilder.buildTree(currentDir);
      courseBuilder.buildCourse(resourceBuilder.lr);
      resourceBuilder.copyAssets(destFolder);
      courseBuilder.generateCourse(destFolder);
      copyTemplateFile("index.html", destFolder);
      copyTemplateFile("netlify.toml", destFolder);
    } catch (err) {
      errorHandling("generate", err);
    }
  } else {
    console.log(chalk.red("Cannot locate course.md. Please Change to course folder and try again."));
  }
}
