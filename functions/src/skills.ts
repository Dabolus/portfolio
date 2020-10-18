import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { CollectionReference } from '@google-cloud/firestore';

let skillsCollection: CollectionReference;

const getFirebaseData = async () => {
  if (!skillsCollection) {
    try {
      admin.initializeApp(functions.config().firebase);
    } catch {}
    skillsCollection =
      skillsCollection || admin.firestore().collection('skills');
  }
  const { docs } = await skillsCollection.get();

  return docs.reduce(
    (skills, skillsSection) => ({
      ...skills,
      [skillsSection.id]: Object.entries(skillsSection.data())
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score),
    }),
    {},
  );
};

const getGithubData = async () => {
  const request = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${functions.config().github.token}`,
    },
    body: JSON.stringify({
      query: `
          query {
            viewer {
              repositories(first: 100) {
                nodes {
                  languages(first: 100) {
                    edges {
                      node {
                        color
                        name
                      }
                      size
                    }
                    totalSize
                  }
                }
              }
            }
          }
        `,
    }),
  });
  const response = await request.json();
  const { total, languages } = response.data.viewer.repositories.nodes.reduce(
    (acc: any, repo: any) => ({
      ...acc,
      total: (acc.total || 0) + repo.languages.totalSize,
      languages: {
        ...acc.languages,
        ...repo.languages.edges.reduce(
          (languages: any, language: any) => ({
            ...languages,
            [language.node.name]: {
              ...acc.languages[language.node.name],
              color: language.node.color,
              size:
                ((acc.languages[language.node.name] || {}).size || 0) +
                language.size,
            },
          }),
          {},
        ),
      },
    }),
    { total: 0, languages: {} },
  );

  return {
    total,
    languages: Object.entries(languages).reduce(
      (languageArr: any, [name, { color, size }]: [string, any]) => {
        const index = languageArr.findIndex(
          (language: any) => language.size < size,
        );
        const newElemIndex = index < 0 ? languageArr.length : index;
        const firstSlice = languageArr.slice(0, newElemIndex);
        const secondSlice = languageArr.slice(newElemIndex);

        return [
          ...firstSlice,
          {
            name,
            size,
            ...(color ? { color } : {}),
          },
          ...secondSlice,
        ];
      },
      [],
    ),
  };
};

// TODO: get also some "how I feel about that language" data from Firestore
export const getSkills = functions.https.onRequest(async (_, res) => {
  const [skills, bytes] = await Promise.all([
    getFirebaseData(),
    getGithubData(),
  ]);

  res.json({ skills, bytes });
});
