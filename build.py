"""Validate and package the standalone public source; no private checkout required."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import subprocess
root = Path(__file__).resolve().parent
subprocess.run(['npm', 'run', 'check'], cwd=root, check=True)
with ZipFile(root / 'ridgefolio-public.zip', 'w', ZIP_DEFLATED) as z:
    for p in sorted((root / 'public').rglob('*')):
        if p.is_file(): z.write(p, p.relative_to(root / 'public'))
print('Packaged ridgefolio-public.zip')
