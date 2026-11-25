import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
await mkdir('dist',{recursive:true});
await build({absWorkingDir:process.cwd(),entryPoints:['reader.mjs'],bundle:true,minify:true,outfile:'dist/reader.js',platform:'browser',target:'es2022'});
for (const file of ['index.html','style.css']) await copyFile(file,'dist/'+file);
import { execFileSync } from 'node:child_process';
execFileSync('python3',['-m','zipfile','-c','examples/round-reader/dist/round-reader-source.zip',
  'package.json','package-lock.json'],{cwd:'../..'});
execFileSync('python3',['-c',`from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path
with ZipFile("examples/round-reader/dist/round-reader-source.zip","a",ZIP_DEFLATED) as z:
    for f in ["examples/fuse.mjs","api/fuse-interface.idl.mjs",*map(str,Path("examples/round-reader").glob("*"))]:
        if Path(f).is_file() and not Path(f).name.startswith("."): z.write(f)
    z.write("examples/round-reader/README.md","README.md")`],{cwd:'../..'});
