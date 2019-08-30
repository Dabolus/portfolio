import * as functions from 'firebase-functions';

export const generateThumbnail = functions.storage
  .object()
  .onFinalize(async object => {
    console.log(object);
  });
