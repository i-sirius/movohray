"""Run the portable HTTP integration suite with an installed Chromium/Edge browser."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('slovokolo-browser.py')), run_name='__main__')
