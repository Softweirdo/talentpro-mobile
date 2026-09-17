# TalentPro Mobile

React Native (Expo) · TypeScript. The employee app: find work, apply, refer friends, track rewards. Fully bilingual, English ⇄ ગુજરાતી.

```bash
npm install
npm start          # press a for Android, i for iOS
```

The Android emulator reaches the host automatically. **A physical phone cannot see `localhost`** — set `extra.apiUrl` in `app.json` to your machine's LAN IP.

Sign in with any seeded number, e.g. `9876543210`. In development the OTP is prefilled from the API response, so the flow is walkable with no SMS gateway.

## Screens

Auth: Splash → Login → OTP → Register.
Tabs: Home (feed) · Jobs (applications) · Refer (referrals) · Profile.
Pushed: Job Detail, Apply Confirm, Share Referral, Edit Profile, Notifications.

## Language

The app is bilingual end to end, not just labelled as such.

- All 152 strings come from `src/i18n/`. The Gujarati was **extracted verbatim from the prototype's own dictionary** rather than re-translated; only strings the prototype had no copy for were written fresh.
- First run picks up the handset language — a Gujarati speaker should not have to find a setting before the app is readable. The switch is then visible on the sign-in screen and in the profile, never buried.
- The choice persists to secure storage and syncs to the server, so push notifications arrive in the right language.
- **Numerals stay monospace in both languages.** Salaries, employee codes, phone numbers, dates and OTP digits are always JetBrains Mono; only prose swaps to Noto Sans Gujarati. Gujarati line heights are loosened so matras are not clipped — the Latin faces' tight tracking would cut them off.
- Category names are *data*, so their Gujarati comes from the database (`nameGu`), not the translation file.

`npm run typecheck` plus the i18n audit in the root README confirm every key used in code exists in both locales.

## Notes

**Built for the actual conditions.** Minimum 52px tap targets, a large explicit pressed state (ripple is unreliable on cheap handsets), two retries with backoff on flaky rather than absent connections, and a distinct "no internet" message separate from a generic error.

**The feed is keyset-paginated**, so a job posted mid-scroll never duplicates or skips a row.

**Employment is read-only, and says why.** Referral tenure and payouts are computed from the employment record, so it is admin-maintained. The screen shows a lock badge and explains it rather than leaving a dead section.

**Push failures are silent by design.** A worker who declines the permission prompt still gets a fully working app.
