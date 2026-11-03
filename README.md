# Style Flow Hub

Mobile-first React + Vite portal for Fashion, Cosmetic.

## Design and data isolation
- A single hub URL provides a top-right mode selector.
- Each mode displays the existing, separately deployed original app in an iframe where allowed.
- Each original app retains its own origin, Supabase project, storage, login and data. No credentials are copied into this repository.
- Use the “원본 열기” link if iframe embedding or third-party browser storage is restricted.
- Unknown deployment URLs are intentionally blank; use the top-right Settings icon to enter the verified URL.
- Custom URLs are saved locally only in this browser. They are not synced between devices.

## Deploy with Cloudflare Pages
- Connect this repository (`style-flow-hub`) to a NEW Cloudflare Pages project.
- Framework: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- No Supabase environment variables are needed for this shell.

## Local checks
```bash
npm install
npm run build
npm run dev
```

The iframe approach is an initial integration shell, not a guarantee of seamless in-page sign-in. Check each original app's embedding/CSP policy, iOS privacy restrictions, microphone/camera permissions and navigation behavior before relying on this for everyday use.

Existing standalone apps remain operational and are not modified by this hub.
