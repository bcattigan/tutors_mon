#!/usr/bin/env node
import * as fs from "fs";
import chalk from "chalk";
import chokidar from "chokidar";
import figlet from "figlet";
import { generate } from "./tutors-gen/tutors-gen";

if (fs.existsSync("course.md")) {
  console.log(chalk.greenBright(figlet.textSync("Tutors mon")));
  generate();
  chokidar.watch(".", { ignored: "json", ignoreInitial: true, usePolling: true, interval: 100, binaryInterval: 300 }).on("all", (event, path) => {
    console.log(`${event}: ${path}`);
    try {
      generate();
    } catch (err) {
      console.log();
    }
  });
} else {
  console.log(chalk.red("Cannot locate course.md. Please Change to course folder and try again."));
}
