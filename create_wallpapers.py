import os

wallpapers = {
    'n64.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="40%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="glowRed" cx="30%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGreen" cx="70%" cy="60%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBlue" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <circle cx="576" cy="432" r="500" fill="url(#glowRed)"/>
  <circle cx="1344" cy="648" r="600" fill="url(#glowGreen)"/>
  <circle cx="960" cy="324" r="550" fill="url(#glowBlue)"/>
  <g opacity="0.08" stroke="#ffffff" stroke-width="2" fill="none" transform="translate(1300, 200) scale(1.4)">
    <path d="M100,50 L200,100 L200,220 L100,270 L0,220 L0,100 Z" />
    <path d="M100,50 L100,170 L200,220" />
    <path d="M100,170 L0,220" />
    <path d="M0,100 L100,170 L200,100" />
  </g>
</svg>''',

    'gba.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#2e1065"/>
      <stop offset="50%" stop-color="#170638"/>
      <stop offset="100%" stop-color="#090117"/>
    </radialGradient>
    <radialGradient id="glowPurple" cx="40%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowCyan" cx="80%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="768" cy="540" r="600" fill="url(#glowPurple)"/>
  <circle cx="1536" cy="432" r="500" fill="url(#glowCyan)"/>
  <path d="M-200,700 C400,600 1000,900 2100,600" stroke="rgba(168,85,247,0.18)" stroke-width="120" fill="none"/>
  <path d="M-200,750 C500,650 1100,950 2100,650" stroke="rgba(6,182,212,0.15)" stroke-width="60" fill="none"/>
</svg>''',

    'snes.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="70%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1200" cy="350" r="220" fill="#3b82f6" opacity="0.25"/>
  <circle cx="1450" cy="450" r="220" fill="#ef4444" opacity="0.25"/>
  <circle cx="1100" cy="600" r="220" fill="#eab308" opacity="0.25"/>
  <circle cx="1350" cy="700" r="220" fill="#22c55e" opacity="0.25"/>
  <g opacity="0.05">
    <line x1="0" y1="0" x2="1920" y2="1080" stroke="#ffffff" stroke-width="12" stroke-dasharray="20,20"/>
    <line x1="0" y1="200" x2="1920" y2="1280" stroke="#ffffff" stroke-width="8" stroke-dasharray="15,15"/>
  </g>
</svg>''',

    'nes.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="40%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#27272a"/>
      <stop offset="60%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="480" width="1920" height="20" fill="#dc2626" opacity="0.6"/>
  <rect x="0" y="520" width="1920" height="10" fill="#dc2626" opacity="0.4"/>
  <circle cx="1400" cy="500" r="450" fill="#dc2626" opacity="0.2"/>
</svg>''',

    'nds.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0b0f19"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="1150" y="200" width="460" height="320" rx="24" fill="none" stroke="rgba(244,114,182,0.25)" stroke-width="4"/>
  <rect x="1150" y="560" width="460" height="320" rx="24" fill="none" stroke="rgba(56,189,248,0.25)" stroke-width="4"/>
  <circle cx="1380" cy="540" r="450" fill="#f472b6" opacity="0.15"/>
</svg>''',

    'gbc.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="45%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="60%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#02120e"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1300" cy="500" r="500" fill="#10b981" opacity="0.28"/>
  <circle cx="800" cy="600" r="400" fill="#a855f7" opacity="0.2"/>
</svg>''',

    'virtualboy.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#450a0a"/>
      <stop offset="50%" stop-color="#1c0404"/>
      <stop offset="100%" stop-color="#050000"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g stroke="#ef4444" stroke-width="1.8" opacity="0.3" fill="none">
    <line x1="960" y1="540" x2="0" y2="1080"/>
    <line x1="960" y1="540" x2="480" y2="1080"/>
    <line x1="960" y1="540" x2="960" y2="1080"/>
    <line x1="960" y1="540" x2="1440" y2="1080"/>
    <line x1="960" y1="540" x2="1920" y2="1080"/>
    <ellipse cx="960" cy="540" rx="200" ry="100"/>
    <ellipse cx="960" cy="540" rx="500" ry="250"/>
    <ellipse cx="960" cy="540" rx="900" ry="450"/>
  </g>
</svg>''',

    'ps1.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="40%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0c4a6e"/>
      <stop offset="60%" stop-color="#082f49"/>
      <stop offset="100%" stop-color="#031622"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1300" cy="450" r="500" fill="#38bdf8" opacity="0.25"/>
  <g opacity="0.12" stroke="#ffffff" stroke-width="6" fill="none" transform="translate(1100, 250)">
    <polygon points="100,50 150,140 50,140" stroke="#10b981" stroke-width="8"/>
    <circle cx="280" cy="95" r="45" stroke="#ef4444" stroke-width="8"/>
    <line x1="380" y1="50" x2="460" y2="140" stroke="#3b82f6" stroke-width="8"/>
    <line x1="460" y1="50" x2="380" y2="140" stroke="#3b82f6" stroke-width="8"/>
    <rect x="520" y="50" width="85" height="85" stroke="#ec4899" stroke-width="8" rx="6"/>
  </g>
</svg>''',

    'psp.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="60%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1400" cy="400" r="500" fill="#60a5fa" opacity="0.3"/>
  <path d="M-200,450 Q400,200 1000,550 T2100,400" fill="none" stroke="rgba(96,165,250,0.35)" stroke-width="90"/>
  <path d="M-200,520 Q400,270 1000,620 T2100,470" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="24"/>
</svg>''',

    'genesis.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="45%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#0f0e26"/>
      <stop offset="100%" stop-color="#050512"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1300" cy="500" r="550" fill="#4338ca" opacity="0.35"/>
  <circle cx="1500" cy="400" r="350" fill="#eab308" opacity="0.2"/>
  <g opacity="0.07" stroke="#ffffff" stroke-width="2" fill="none">
    <rect x="1100" y="300" width="600" height="400" rx="20"/>
    <circle cx="1400" cy="500" r="160"/>
  </g>
</svg>''',

    'sms.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="60%" stop-color="#1c0a00"/>
      <stop offset="100%" stop-color="#090300"/>
    </radialGradient>
    <pattern id="smsgrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none" stroke="rgba(251,146,60,0.1)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#smsgrid)"/>
  <circle cx="1300" cy="500" r="500" fill="#f97316" opacity="0.25"/>
</svg>''',

    'arcade.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#4a044e"/>
      <stop offset="60%" stop-color="#1f0221"/>
      <stop offset="100%" stop-color="#080009"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="800" cy="500" r="500" fill="#ec4899" opacity="0.3"/>
  <circle cx="1400" cy="450" r="500" fill="#06b6d4" opacity="0.3"/>
</svg>''',

    'atari.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="40%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="60%" stop-color="#2d1404"/>
      <stop offset="100%" stop-color="#0d0500"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1300" cy="480" r="500" fill="#d97706" opacity="0.3"/>
  <path d="M1100,700 C1250,300 1350,300 1500,700" stroke="rgba(251,191,36,0.25)" stroke-width="40" fill="none"/>
  <line x1="1300" y1="300" x2="1300" y2="700" stroke="rgba(251,191,36,0.3)" stroke-width="25"/>
</svg>''',

    'pce.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="60%" stop-color="#052e16"/>
      <stop offset="100%" stop-color="#011208"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="1300" cy="450" r="500" fill="#22c55e" opacity="0.25"/>
  <circle cx="1500" cy="600" r="350" fill="#ea580c" opacity="0.22"/>
</svg>'''
}

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'wallpapers')
os.makedirs(out_dir, exist_ok=True)
for filename, content in wallpapers.items():
    p = os.path.join(out_dir, filename)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content.strip())
print(f"Successfully wrote {len(wallpapers)} wallpapers to {out_dir}")
