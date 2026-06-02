/**
 * Restores the published Lacuna NuGet packages and assembles their compiled
 * assemblies + XML doc files into ./api-bin, which docfx then reads to produce
 * API metadata (see docfx.json → generate-api-docs.mjs).
 *
 * Why DLL+XML instead of building from source:
 *   The library repos don't build locally — Lacuna.Pki needs the private
 *   Lacuna.T8 package, the connectors need .NET Framework 4.5 targeting packs,
 *   and Lacuna.RestClient trips NuGet audit. The published packages already
 *   ship the compiled assembly + XML doc comments, so docfx reads the released
 *   public API directly. (Unresolved deps like Lacuna.T8 are harmless warnings.)
 *
 * Usage:
 *   node scripts/fetch-api-assemblies.mjs
 *   docfx metadata docfx.json
 *   node scripts/generate-api-docs.mjs
 *
 * Bump a version here when a new release should be documented.
 */

import { execFileSync } from 'child_process';
import fs   from 'fs';
import os   from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const PACKAGES = [
  { id: 'Lacuna.Pki',                          version: '2.22.3' },
  { id: 'Lacuna.RestPki.Client',               version: '4.2.2'  },
  { id: 'Lacuna.Pki.AzureConnector',           version: '2.2.0'  },
  { id: 'Lacuna.Pki.AmazonConnector',          version: '1.2.0'  },
  { id: 'Lacuna.Pki.EntityFrameworkConnector', version: '1.2.0'  },
  { id: 'Lacuna.Pki.NLogConnector',            version: '1.2.0'  },
];

// Preferred assembly TFM, richest first. Each package may ship a subset.
const TFM_PREFERENCE = [
  'net48', 'net472', 'net471', 'net47', 'net462', 'net461', 'net46',
  'net452', 'net451', 'net45', 'netstandard2.1', 'netstandard2.0',
];

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT        = path.resolve(SCRIPT_DIR, '..', 'api-bin');
const CACHE      = path.join(os.homedir(), '.nuget', 'packages');

// 1. Restore into the global package cache via a throwaway project. A net48
//    target can consume every package above (net45/netstandard2.0/…); restore
//    needs no targeting packs (only building would).
const tmp  = fs.mkdtempSync(path.join(os.tmpdir(), 'lacuna-apidocs-'));
const proj = path.join(tmp, 'restore.csproj');
fs.writeFileSync(proj,
  '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup>' +
  '<TargetFramework>net48</TargetFramework><NoWarn>NU1701;NU1903</NoWarn>' +
  '</PropertyGroup><ItemGroup>' +
  PACKAGES.map(p => `<PackageReference Include="${p.id}" Version="${p.version}" />`).join('') +
  '</ItemGroup></Project>');

console.log('Restoring packages…');
execFileSync('dotnet', ['restore', proj, '--verbosity', 'quiet'], { stdio: 'inherit' });

// 2. Copy each package's best-available DLL + XML into ./api-bin. Keeping every
//    Lacuna assembly side by side lets docfx resolve cross-assembly references
//    (connectors → Lacuna.Pki, RestPki.Client → RestClient, …).
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let copied = 0;
for (const { id, version } of PACKAGES) {
  const libDir = path.join(CACHE, id.toLowerCase(), version, 'lib');
  const tfms   = fs.existsSync(libDir) ? fs.readdirSync(libDir) : [];
  const tfm    = TFM_PREFERENCE.find(t => tfms.includes(t));
  if (!tfm) { console.warn(`  ! ${id} ${version}: no usable TFM (have: ${tfms.join(', ') || 'none'})`); continue; }

  const dll = path.join(libDir, tfm, `${id}.dll`);
  const xml = path.join(libDir, tfm, `${id}.xml`);
  if (!fs.existsSync(dll)) { console.warn(`  ! ${id}: ${id}.dll not found in ${tfm}`); continue; }

  fs.copyFileSync(dll, path.join(OUT, `${id}.dll`));
  const hasXml = fs.existsSync(xml);
  if (hasXml) fs.copyFileSync(xml, path.join(OUT, `${id}.xml`));
  console.log(`  ${id} ${version} (${tfm})${hasXml ? '' : '  [no XML docs!]'}`);
  copied++;
}

console.log(`\n${copied}/${PACKAGES.length} assemblies → ${OUT}`);
console.log('Next: docfx metadata docfx.json  &&  node scripts/generate-api-docs.mjs');
