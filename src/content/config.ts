export const SITE = {
  name: 'Shawn Casey',
  vaultName: 'shawn-casey',
  gtEmail: 'shawn.casey@gatech.edu',
  linkedin: 'https://www.linkedin.com/in/shawncaseyx/',
  github: 'https://github.com/shawn-casey',
  /** Order of folders in the file explorer. */
  folders: ['Home', 'Experience', 'Projects', 'Entrepreneurship', 'Hobbies', 'Education'] as const,
};

export type FolderName = (typeof SITE.folders)[number];

/** Graph "groups", the same idea as Obsidian's colour groups. */
export const FOLDER_COLOR: Record<string, string> = {
  Home: '#b3a4ff',
  Experience: '#5da9e9',
  Projects: '#57b98a',
  Entrepreneurship: '#d9b44a',
  Hobbies: '#e07a5f',
  Education: '#43c3bb',
};
