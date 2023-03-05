import path from "path";
import fm from "front-matter";
import * as fs from "fs";
import { imageTypes, LearningResource, VideoIdentifiers } from "../builders/lo-types";
import { getFileType, getHeaderFromBody, readFirstLineFromFile, readWholeFile, withoutHeaderFromBody, errorHandling } from "./utils";

export function getFileWithName(lr: LearningResource, file: string) {
  let foundFilePath = "";
  try {
    lr.files.forEach((filePath) => {
      const fileName = path.basename(filePath);
      if (fileName === file) {
        foundFilePath = filePath;
      }
    });
  } catch (err) {
    errorHandling("getFileWithName", err);
  }
  return foundFilePath;
}

export function getRoute(lr: LearningResource, path = false): string {
  let route = "";
  try {
    route = path ? lr.route.replace(/\\/g, "/") : `/${lr.type}/{{COURSEURL}}${lr.route.replace(lr.courseRoot, "")}`;
  } catch (err) {
    errorHandling("getRoute", err);
  }
  return route;
}

export function getFileWithType(lr: LearningResource, types: string[]): string {
  let file = "";
  try {
    const files = lr.files.filter((file) => types.includes(getFileType(file)));
    if (files.length) {
      file = files[0];
    }
  } catch (err) {
    errorHandling("getFileWithType", err);
  }
  return file;
}

export function getFilesWithType(lr: LearningResource, type: string): string[] {
  let files = [""];
  try {
    files = lr.files.filter((file) => type.includes(getFileType(file)));
  } catch (err) {
    errorHandling("getFilesWithType", err);
  }
  return files;
}

export function getFilesWithTypes(lr: LearningResource, types: string[]): string[] {
  let files = [""];
  try {
    files = lr.files.filter((file) => types.includes(getFileType(file)));
  } catch (err) {
    errorHandling("getFilesWithTypes", err);
  }
  return files;
}

export function getId(lr: LearningResource): string {
  let id = "";
  try {
    id = path.basename(lr.route);
  } catch (err) {
    errorHandling("getId", err);
  }
  return id;
}

export function getImage(lr: LearningResource, path = false): string {
  let imageFile = getFileWithType(lr, imageTypes);
  if (imageFile) {
    imageFile = path ? imageFile.replace(/\\/g, "/") : `https://{{COURSEURL}}${imageFile.replace(lr.courseRoot, "")}`;
  }
  return imageFile;
}

export function getArchive(lr: LearningResource, path = false): string {
  let archiveFile = getFileWithType(lr, [".zip"]);
  if (archiveFile) {
    archiveFile = path ? archiveFile.replace(/\\/g, "/") : `https://{{COURSEURL}}${archiveFile.replace(lr.courseRoot, "")}`;
  }
  return archiveFile;
}

export function getWebLink(lr: LearningResource): string {
  const webLinkFile = getFileWithName(lr, "weburl");
  return readFirstLineFromFile(webLinkFile);
}

export function getGitLink(lr: LearningResource): string {
  const webLinkFile = getFileWithName(lr, "githubid");
  return readFirstLineFromFile(webLinkFile);
}

export function getLabImage(lr: LearningResource, path = false): string {
  let foundFilePath = "";
  try {
    const imageLrs = lr.lrs.filter((lr) => lr.id === "img");
    if (imageLrs.length > 0) {
      const imageFiles = getFilesWithTypes(imageLrs[0], imageTypes);
      imageFiles.forEach((filePath) => {
        if (filePath.includes("/img/main")) {
          foundFilePath = path ? filePath.replace(/\\/g, "/") : `https://{{COURSEURL}}${filePath.replace(lr.courseRoot, "")}`;
        }
      });
    }
  } catch (err) {
    errorHandling("getLabImage", err);
  }
  return foundFilePath;
}

export function getPdf(lr: LearningResource, path = false): string {
  let pdfFile = getFileWithType(lr, ["pdf"]);
  if (pdfFile) {
    pdfFile = path ? pdfFile.replace(/\\/g, "/") : `https://{{COURSEURL}}${pdfFile.replace(lr.courseRoot, "")}`;
  }
  return pdfFile;
}

export function getVideo(lr: LearningResource, id: string): string {
  let videoId = "";
  if (id) {
    videoId = `/video/{{COURSEURL}}${lr.route.replace(lr.courseRoot, "")}/${id}`;
  }
  return videoId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMarkdown(lr: LearningResource): [string, string, string, any] {
  const mdFile = getFileWithType(lr, [".md"]);
  let markDown: [string, string, string, unknown] = ["", "", "", {}];
  try {
    if (mdFile) {
      const contents = fm(readWholeFile(mdFile));
      const frontMatter = contents.attributes;
      const title = getHeaderFromBody(contents.body);
      const summary = withoutHeaderFromBody(contents.body);
      const contentsMd = contents.body;
      markDown = [title, summary, contentsMd, frontMatter];
    }
  } catch (err) {
    errorHandling("getMarkdown", err);
  }
  return markDown;
}

export function readVideoIds(lr: LearningResource): VideoIdentifiers {
  const videos: VideoIdentifiers = {
    videoid: "",
    videoIds: []
  };

  const videoIdFile = getFileWithName(lr, "videoid");

  try {
  if (videoIdFile) {
    const entries = fs.readFileSync(videoIdFile).toString().split("\n");

    entries.forEach((entry) => {
      if (entry !== "") {
        if (entry.includes("heanet") || entry.includes("vimp")) {
          const array = entry.split("=");
          const newEntry = {
            service: array[0].replace("\r", ""),
            id: array[1].replace("\r", "")
          };
          videos.videoIds.push(newEntry);
        } else {
          videos.videoid = entry;
          videos.videoIds.push({ service: "youtube", id: entry });
        }
      }
    });
  }
  if (videos.videoIds.length > 0) {
    videos.videoid = videos.videoIds[videos.videoIds.length - 1].id;
  }
} catch (err) {
  errorHandling("readVideoIds", err);
}
return videos;
}
