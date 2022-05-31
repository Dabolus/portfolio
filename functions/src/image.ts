import { App, initializeApp, getApp } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import functions from 'firebase-functions';
import sharp, { Sharp } from 'sharp';
import primitive from 'primitive';
import { optimize as svgOptimize } from 'svgo';
import toSafeDataURI from 'mini-svg-data-uri';
import type { Bucket } from '@google-cloud/storage';
import type { CollectionReference } from '@google-cloud/firestore';

const placeholderWidth = 256;
const placeholderHeight = 256;

let app: App;
let storage: Storage;
let firestore: Firestore;
let bucket: Bucket;
let projectsCollection: CollectionReference;
let certificationsCollection: CollectionReference;

const optimize = async (svg: string): Promise<string> => {
  const result = svgOptimize(svg, {
    multipass: true,
    floatPrecision: 1,
  });

  if (result.modernError) {
    throw result.modernError;
  }

  return result.data;
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
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${placeholderWidth} ${placeholderHeight}">${filter}`,
  );
  return toSafeDataURI(finalSVG);
};

const generateWebp = async (
  sharpInstance: Sharp,
  entity: string,
  name: string,
  bucket: Bucket,
) => {
  process.stdout.write('Generating webp image...\n');
  const webpBuffer = await sharpInstance
    .webp({
      alphaQuality: 0,
      quality: 100,
    })
    .toBuffer();
  await bucket.file(`${entity}/${name}.webp`).save(webpBuffer, {
    contentType: 'image/webp',
  });
};

const generatePlaceholder = async (
  sharpInstance: Sharp,
  contentType: string,
) => {
  process.stdout.write('Scaling image...\n');
  const scaledBuffer = await sharpInstance
    .resize(placeholderWidth, placeholderHeight)
    .toBuffer();
  process.stdout.write('Detecting primitive SVG shapes on image...\n');
  const model = await primitive({
    input: `data:${contentType};base64,${scaledBuffer.toString('base64')}`,
    numSteps: 8,
    shapeType: 'random',
  });
  const svg = model.toSVG();
  process.stdout.write('Optimizing generated SVG...\n');
  const optimizedSVG = await optimize(svg);
  process.stdout.write('Postprocessing optimized SVG...\n');
  return postProcess(optimizedSVG);
};

const getCollection = (entity: string) => {
  if (!app) {
    try {
      app = initializeApp(functions.config().firebase);
    } catch {
      app = getApp();
    }
  }

  if (!firestore) {
    firestore = getFirestore(app);
  }

  switch (entity) {
    case 'projects':
      if (!projectsCollection) {
        projectsCollection = firestore.collection('projects');
      }

      return projectsCollection;
    case 'certifications':
      if (!certificationsCollection) {
        certificationsCollection = firestore.collection('certifications');
      }

      return certificationsCollection;
    default:
      throw new Error('Invalid entity');
  }
};

export const processImage = functions.storage
  .object()
  .onFinalize(async ({ name = '', contentType = '' }) => {
    if (!name || !contentType) {
      process.stdout.write('Missing name or content type, ignoring file.\n');
      return;
    }

    // We expect the file name to be the same as the ID of our project/certification ID on Firestore
    const match = name.match(
      /^(projects|certifications)\/([a-zA-Z\d-]+)\.jpg$/,
    );

    if (!match) {
      process.stdout.write(
        'Uploaded image is not a project or a certification image, ignoring it.\n',
      );
      return;
    }

    const [, entity, id] = match;
    process.stdout.write(
      `Generating thumbnail for ${entity.slice(0, -1)} '${id}'...\n`,
    );

    if (!app) {
      try {
        app = initializeApp(functions.config().firebase);
      } catch {
        app = getApp();
      }
    }

    if (!storage) {
      storage = getStorage(app);
    }

    if (!bucket) {
      bucket = storage.bucket();
    }

    const collection = getCollection(entity);

    process.stdout.write('Downloading image...\n');
    const [buffer] = await bucket.file(name).download();
    const firstSharpInstance = sharp(buffer);
    const secondSharpInstance = firstSharpInstance.clone();
    const [placeholder] = await Promise.all([
      generatePlaceholder(secondSharpInstance, contentType),
      generateWebp(firstSharpInstance, entity, id, bucket),
    ]);

    process.stdout.write('Saving icon URL and thumbnail to Firestore...\n');
    await collection.doc(id).set(
      {
        icon: {
          jpg: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${entity}%2F${id}.jpg?alt=media`,
          webp: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${entity}%2F${id}.webp?alt=media`,
          placeholder,
        },
      },
      {
        merge: true,
      },
    );
    process.stdout.write('Done!\n');
  });
