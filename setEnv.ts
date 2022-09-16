/* tslint:disable */
// @ts-nocheck
const { writeFile, existsSync, mkdirSync } = require('fs');
const { argv } = require('yargs');

require('dotenv').config();
const environment = argv.environment || 'prod';
const project = argv.project;

if (!project) {
  console.error('Please provide a project name.');
  return false;
}

const envData = process.env['FIREBASE_' + project.toUpperCase()];

if (!envData) {
  console.error('Cannot find config data with given project name.');
  return false;
}

function writeFileUsingFS(targetPath, firebaseConfigContent) {
  writeFile(targetPath, firebaseConfigContent, function (err) {
    if (err) {
      console.log(err);
    }
    if (firebaseConfigContent !== '') {
      console.log(`wrote variables to ${targetPath}`);
    }
  });
}

// Providing path to the `environments` directory
const configDir = `./projects/common-library/src/lib`;

// creates the `environments` directory if it does not exist
if (!existsSync(configDir)) {
  console.error('Cannot find project with given project name');
  return false;
}


// choose the correct targetPath based on the environment chosen
const targetPath = `${configDir}/firebase.config.ts`;

//actual content to be compiled dynamically and pasted into respective environment files
const firebaseConfigContent = `// This file was autogenerated by dynamically running setEnv.ts and using dotenv for managing API key secrecy
export const FIREBASE_CONFIG = ${envData};`;

writeFileUsingFS(targetPath, firebaseConfigContent); // appending data into the target file

/* tslint:enable */
