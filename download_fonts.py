import urllib.request
import os
import concurrent.futures

BASE_URL = "https://cloud.smilegenix.ae/assets/"
OUTPUT_DIR = r"D:\Antigravity\velourcare-ortho-cloud\public\assets"

files_to_download = [
  "us-C8Qg3PI3.svg",
  "spain-CPPC24t_.svg",
  "hkgrotesk-bold-CNnIfM9m.woff",
  "hkgrotesk-light-Bch7Jc8H.woff",
  "hkgrotesk-medium-CPEAN8-4.woff",
  "hkgrotesk-regular-BONCcfZ_.woff",
  "la-solid-900-DkmX4G2x.eot",
  "la-regular-400-ehe5HgcS.woff",
  "boxicons-CTVby2V1.woff",
  "boxicons-CSrLvhY_.eot",
  "la-regular-400-CmnW_RTo.ttf",
  "la-solid-900-TjMEgv3Q.woff2",
  "la-solid-900-CR_Kd-su.woff",
  "chat-bg-pattern-Wh8Pe75p.png",
  "la-brands-400-D0lxOIwB.woff",
  "boxicons-CeGEncwm.woff2",
  "hkgrotesk-semibold-CaqhRViJ.woff",
  "la-solid-900-BUOWlSBQ.ttf",
  "boxicons-EIQNrSje.ttf",
  "hkgrotesk-medium-DhAVEcVM.eot",
  "hkgrotesk-light-CFOlwwJU.eot",
  "la-brands-400-LN4CMlGg.eot",
  "la-brands-400-Cq-R4OEF.woff2",
  "la-regular-400-DuFMN_sw.woff2",
  "la-regular-400-Cx6vm3uW.eot",
  "hkgrotesk-semibold-D2R7JsFz.eot",
  "la-brands-400-gDglUfU7.ttf",
  "hkgrotesk-regular-C5FQFgYW.eot"
]

def fetch(f):
    dest = os.path.join(OUTPUT_DIR, f)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return f"Cached: {f}"
    url = BASE_URL + f
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            with open(dest, 'wb') as out:
                out.write(data)
        return f"Downloaded: {f} ({len(data)} bytes)"
    except Exception as e:
        return f"Failed: {f} - {e}"

print(f"Starting download of {len(files_to_download)} missing assets...")
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(fetch, files_to_download))

for r in results:
    print(r)
