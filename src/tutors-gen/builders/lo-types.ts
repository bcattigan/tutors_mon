export const imageTypes = [".png", ".jpg", ".jpeg", ".gif"];

export const assetTypes = imageTypes.concat([".pdf", ".zip"]);

export class Properties {
  [key: string]: string;
}

export interface VideoIdentifier {
  service: string;
  id: string;
}

export interface VideoIdentifiers {
  videoid: string;
  videoIds: VideoIdentifier[];
}

export interface LearningResource {
  courseRoot: string;
  route: string;
  routePath: string;
  id: string;
  lrs: LearningResource[];
  files: Array<string>;
  type: string;
}

export interface LabStep {
  title: string;
  shortTitle: string;
  contentMd: string;
  route: string;
  routePath: string;
  id: string;
}

export interface LearningObject {
  id: string;
  route: string;
  routePath: string;
  type: string;
  title: string;
  summary: string;
  img: string;
  imgPath: string;
  pdf: string;
  pdfPath: string;
  contentMd: string;
  video: string;
  videoids: VideoIdentifiers;
  frontMatter: Properties;
  los: Array<LearningObject | LabStep>;
  properties?: Properties;
  calendar?: Properties;
  hide: boolean;
  enrollment?: string[];
  zip: string
  zipPath: string
}

export const loTypes = ["/note", "/book", "/archive", "/web", "/github", "/panelnote", "/paneltalk", "/panelvideo", "/talk", "/unit", "/side", "/topic"];

export const preOrder = new Map([
  ["unit", 1],
  ["side", 2],
  ["talk", 3],
  ["lab", 4],
  ["note", 5],
  ["web", 6],
  ["github", 7],
  ["panelnote", 8],
  ["paneltalk", 9],
  ["archive", 10],
  ["panelvideo", 11],
  ["topic", 12],
  ["unknown", 13],
  ["", 0],
]);
