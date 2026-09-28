import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
try:
    req = urllib.request.Request('https://tscc.de/2048.php', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, context=ctx, timeout=5).read().decode('utf-8', errors='ignore')
    links = re.findall(r'href=[\"\']([^\"\']+\.nes)[\"\']', res)
    for l in links:
        if not l.startswith('http'):
            l = 'https://tscc.de/' + l.lstrip('/')
        req2 = urllib.request.Request(l, headers={'User-Agent': 'Mozilla/5.0'})
        res2 = urllib.request.urlopen(req2, context=ctx, timeout=5).read()
        with open('ROMS/nes/2048.nes', 'wb') as f:
            f.write(res2)
        print('Descargado 2048 NES con éxito:', l, len(res2))
except Exception as e:
    print(e)
