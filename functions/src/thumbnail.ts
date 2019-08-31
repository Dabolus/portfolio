import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import sharp from 'sharp';
import primitive from 'primitive';
import SVGO from 'svgo';
import toSafeDataURI from 'mini-svg-data-uri';
import { Bucket } from '@google-cloud/storage';
import { CollectionReference } from '@google-cloud/firestore';

const thumbnailWidth = 256;
const thumbnailHeight = 256;

let bucket: Bucket;
let projectsCollection: CollectionReference;
let svgOptimizer: SVGO;

const optimize = async (svg: string): Promise<string> => {
  svgOptimizer =
    svgOptimizer ||
    new SVGO({
      multipass: true,
      floatPrecision: 1,
    } as any);
  const { data } = await svgOptimizer.optimize(svg);
  return data;
};

const patchSVGGroup = (svg: string): string => {
  const gStartIndex =
    svg.match(/<path.*?>/)!.index! + svg.match(/<path.*?>/)![0].length;
  const gEndIndex = svg.match(/<\/svg>/)!.index;
  const svgG = `<g filter='url(#c)' fill-opacity='.5'>`;
  return `${svg.slice(0, gStartIndex)}${svgG}${svg.slice(
    gStartIndex,
    gEndIndex,
  )}</g></svg>`;
};

const postProcess = (svg: string): string => {
  let blurStdDev = 12;
  let blurFilterId = 'b';
  let newSVG;

  if (svg.match(/<svg.*?><path.*?><g/) === null) {
    blurStdDev = 55;
    newSVG = patchSVGGroup(svg);
    blurFilterId = 'c';
  } else {
    newSVG = svg.replace(/(<g)/, `<g filter="url(#${blurFilterId})"`);
  }
  const filter = `<filter id="${blurFilterId}"><feGaussianBlur stdDeviation="${blurStdDev}"/></filter>`;
  const finalSVG = newSVG.replace(
    /(<svg)(.*?)(>)/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${thumbnailWidth} ${thumbnailHeight}">${filter}`,
  );
  return toSafeDataURI(finalSVG);
};

export const generateThumbnail = functions.storage
  .object()
  .onFinalize(async ({
    name = '',
    contentType = '',
  }) => {
    if (!name || !contentType) {
      process.stdout.write('Missing name or content type, ignoring file.\n');
      return;
    }

    // We expect the file name to be the same as the ID of our project ID on Firestore
    const match = name.match(/^projects\/([a-zA-Z\d-]+)/);
    if (!match) {
      process.stdout.write('Uploaded image is not a project image, ignoring it.\n');
      return;
    }
    const [, projectId] = match;
    process.stdout.write(`Generating thumbnail for project '${projectId}'...\n`);

    if (!bucket || !projectsCollection) {
      try {
        admin.initializeApp(functions.config().firebase);
      } catch {}
      bucket = admin.storage().bucket();
      projectsCollection = admin.firestore().collection('projects');
    }

    process.stdout.write('Downloading image...\n');
    const [buffer] = await bucket.file(name).download();
    process.stdout.write('Scaling image...\n');
    const scaledBuffer = await sharp(buffer)
      .resize(thumbnailWidth, thumbnailHeight)
      .toBuffer();
    process.stdout.write('Detecting primitive SVG shapes on image...\n');
    const model = await primitive({
      input: `data:${contentType};base64,${scaledBuffer.toString(
        'base64',
      )}`,
      numSteps: 8,
      shapeType: 'random',
    });
    const svg = model.toSVG();
    process.stdout.write('Optimizing generated SVG...\n');
    const optimizedSVG = await optimize(svg);
    process.stdout.write('Postprocessing optimized SVG...\n');
    const postprocessedSVG = postProcess(optimizedSVG);

    process.stdout.write('Saving icon URL and thumbnail to Firestore...\n');
    await projectsCollection.doc(projectId).set({
      icon: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/projects/${name}?alt=media`,
      placeholder: postprocessedSVG,
    });
    process.stdout.write('Done!\n');
  });
