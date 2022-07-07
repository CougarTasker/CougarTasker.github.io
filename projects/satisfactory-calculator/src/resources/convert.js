
async function convertTGA(folder) {
  if (folder === undefined) {
    folder = Deno.cwd();
  }
  const d= [];
  for await (const fileOrFolder of Deno.readDir(folder)) {
    if (fileOrFolder.isFile && fileOrFolder.name.endsWith(".tga")) {
      Deno.run({ cmd: ["convert", `${folder}/${fileOrFolder.name}`, `${folder}/${fileOrFolder.name.slice(0, -4)}.png`] })
    } else if (fileOrFolder.isDirectory) {
      d.push(convertTGA(`${folder}/${fileOrFolder.name}`));
    }

  }
  Promise.all(d);
}

export default convertTGA
