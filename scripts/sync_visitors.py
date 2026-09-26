"""Refresh public, aggregate country counts. Never collect individual visitor records."""
from pathlib import Path
from urllib.request import Request, urlopen
from datetime import datetime, timezone
from html import unescape
import json, re

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://s01.flagcounter.com/countries/6R7o/'

def parse_countries(html):
    countries = {}
    # Parse only national rows, excluding the provider's nested regional tables.
    pattern = r'<a\s+href=["\']?/factbook/([a-z]{2})/6R7o[^>]*>\s*<u>([^<]+)</u></a>\s*</font></td>\s*<td[^>]*>\s*<font[^>]*>([\d,.]+)</font>'
    for code, name, number in re.findall(pattern, html, re.I):
        countries[code.upper()] = {'code':code.upper(), 'name':unescape(name), 'visits':int(re.sub(r'[^0-9]', '', number))}
    expected = re.search(r'Countries\s+\d+\s*-\s*\d+\s+of\s+(\d+)', html)
    if not expected or len(countries) != int(expected.group(1)) or not countries:
        raise ValueError('Incomplete country data; keeping the last successful snapshot.')
    return sorted(countries.values(), key=lambda c:(-c['visits'], c['code']))

def main():
    req = Request(URL, headers={'User-Agent':'HongjieZhu-VisitorMap/1.0'})
    with urlopen(req, timeout=30) as response:
        countries = parse_countries(response.read().decode('utf-8'))
    data = {'source':URL, 'updated_at':datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'countries':countries, 'country_count':len(countries), 'recorded_visits':sum(c['visits'] for c in countries)}
    target = ROOT/'assets/visitor-stats.json'
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('Updated aggregate visitor map:',len(countries),'countries / regions.')

if __name__ == '__main__':
    main()
