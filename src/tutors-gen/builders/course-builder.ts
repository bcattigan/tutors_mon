import fm from "front-matter";
import {
  getArchive,
  getFilesWithType,
  getFileWithName,
  getGitLink,
  getId,
  getImage,
  getLabImage,
  getMarkdown,
  getPdf,
  getRoute,
  getVideo,
  getWebLink,
  readVideoIds
} from "../utils/lr-utils";
import { LabStep, LearningObject, LearningResource, preOrder } from "./lo-types";
import { readWholeFile, readYamlFile, writeFile } from "../utils/utils";

export const courseBuilder = {
  lo: <LearningObject>{},

  buildLo(lr: LearningResource, level: number): LearningObject {
    let lo = this.buildDefaultLo(lr);
    switch (lo.type) {
      case "unit":
        this.buildUnit(lo);
        break;
      case "side":
        this.buildSide(lo);
        break;
      case "lab":
        lo = this.buildLab(lo, lr);
        break;
      case "talk":
        this.buildTalk(lo);
        break;
      case "panelvideo":
        this.buildPanelvideo(lo);
        break;
      case "web":
        lo.route = getWebLink(lr);
        break;
      case "github":
        lo.route = getGitLink(lr);
        break;
      case "archive":
        lo.route = getArchive(lr);
        break;
      default:
    }
    if (lo.type != "lab" && lo.type != "note") {
      lr.lrs.forEach((lr) => {
        lo.los.push(this.buildLo(lr, level + 1));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lo.los.sort((a: any, b: any) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return preOrder.get(a.type)! - preOrder.get(b.type)!;
        });
      });
    }
    return lo;
  },

  buildDefaultLo(lr: LearningResource): LearningObject {
    const [title, summary, contentMd, frontMatter] = getMarkdown(lr);
    const videoids = readVideoIds(lr);
    const lo: LearningObject = {
      route: getRoute(lr),
      routePath: getRoute(lr, true),
      type: lr.type,
      title: title,
      summary: summary,
      contentMd: contentMd,
      frontMatter: frontMatter,
      id: getId(lr),
      img: getImage(lr),
      imgPath: getImage(lr, true),
      pdf: getPdf(lr),
      pdfPath: getPdf(lr, true),
      video: getVideo(lr, videoids.videoid),
      videoids: videoids,
      los: [],
      hide: false,
      zip: getArchive(lr),
      zipPath: getArchive(lr, true)
    };
    return lo;
  },

  buildUnit(lo: LearningObject) {
    lo.route = lo.route.substring(0, lo.route.lastIndexOf("/")) + "/";
    lo.route = lo.route.replace("/unit", "/topic");
  },

  buildTalk(lo: LearningObject) {
    if (!lo.pdf) {
      lo.route = lo.video;
    }
  },

  buildSide(lo: LearningObject) {
    lo.route = lo.route.substring(0, lo.route.lastIndexOf("/")) + "/";
    lo.route = lo.route.replace("/side", "/topic");
  },

  buildPanelvideo(lo: LearningObject) {
    lo.route = lo.video;
  },

  buildLab(lo: LearningObject, lr: LearningResource): LearningObject {
    const mdFiles = getFilesWithType(lr, ".md");
    lo.title = "";
    mdFiles.forEach((chapterName) => {
      const wholeFile = readWholeFile(chapterName);
      const contents = fm(wholeFile);
      let theTitle = contents.body.substring(0, contents.body.indexOf("\n"));
      theTitle = theTitle.replace("\r", "");
      const shortTitle = chapterName.substring(chapterName.indexOf(".") + 1, chapterName.lastIndexOf("."));
      if (lo.title == "") lo.title = shortTitle;
      const labStep: LabStep = {
        title: theTitle,
        shortTitle: shortTitle,
        contentMd: contents.body,
        route: `${getRoute(lr)}/${shortTitle}`,
        routePath: `${getRoute(lr, true)}/${shortTitle}`,
        id: shortTitle
      };
      lo.los.push(labStep);
    });
    lo.img = getLabImage(lr);
    lo.imgPath = getLabImage(lr, true);
    // lr.lrs = [];
    return lo;
  },

  buildCourse(lr: LearningResource) {
    this.lo = this.buildLo(lr, 0);
    this.lo.type = "course";
    this.lo.route = "/";
    const propertiesFile = getFileWithName(lr, "properties.yaml");
    if (propertiesFile) {
      this.lo.properties = readYamlFile(propertiesFile);
      const ignoreList = this.lo.properties?.ignore;
      if (ignoreList) {
        const los = this.lo.los.filter((lo) => ignoreList.indexOf(lo.id) >= 0);
        los.forEach((lo) => {
          if ("type" in lo) lo.hide = true;
        });
      }
    }
    const calendarFile = getFileWithName(lr, "calendar.yaml");
    if (calendarFile) {
      this.lo.calendar = readYamlFile(calendarFile);
    }
    const enrollmentFile = getFileWithName(lr, "enrollment.yaml");
    if (enrollmentFile) {
      this.lo.enrollment = readYamlFile(enrollmentFile);
    }
  },

  generateCourse(outputFolder: string) {
    writeFile(outputFolder, "tutors.json", JSON.stringify(this.lo, null, 2));
  }
};
