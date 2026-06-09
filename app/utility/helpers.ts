import * as path from 'path';

// Determine the base directory path
export const DIR_PATH = (path.resolve('./../').includes('www')) ? path.resolve('./../') : path.resolve('./');
export const DATA_PATH = path.join(DIR_PATH, 'data');
export const STATIC_PATH = path.join(DIR_PATH, 'static');
export const IMAGE_PATH = path.join(DIR_PATH, 'images', 'uploaded');
export const TEMPLATE_PATH = path.join(DIR_PATH, 'images', 'template');

export const formatFolderDisplayName = (folderName: string): string => {
    const match = folderName.match(/-(\d{14})$/);

    if (!match) {
      return folderName;
    }

    const timestamp = match[1];
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    const second = timestamp.slice(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };