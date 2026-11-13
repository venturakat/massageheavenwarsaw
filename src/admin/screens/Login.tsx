/** Login, error, password reset and "check your inbox" (Figma 410:1353, 410:1389, 410:1426, 410:1461). */
import { useState } from 'preact/hooks';
import { api, DEMO_PASSWORD } from '../api';
import { Button, TextInput, Toggle } from '../ui';
import logoWhite from '../../assets/brand/logo-white.svg?url';
import arch from '../pdf/arch.jpg?url';

const DEFAULT_EMAIL = 'kontakt@massageheavenwarsaw.com';

export function Login({ route, onLoggedIn }: { route: string; onLoggedIn: () => void }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    const ok = await api.login(email.trim(), password, remember);
    setBusy(false);
    if (ok) onLoggedIn();
    else setError(true);
  };
  const sendReset = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    await api.requestPasswordReset(email.trim());
    setBusy(false);
    location.hash = '#/reset/wyslano';
  };

  return (
    <div class="login">
      <aside class="login__brand">
        <img class="login__logo" src={logoWhite} alt="Massage Heaven" width="170" height="31" />
        <div class="login__visual" aria-hidden="true">
          <span class="login__halo" />
          <img class="login__arch" src={arch} alt="" />
        </div>
        <div class="login__tagline">
          <p>Chwila tylko dla Ciebie</p>
          <span class="label">Warszawa · Krucza 16/22</span>
        </div>
      </aside>

      <main class="login__side">
        {route === 'reset' && (
          <form class="login__form" onSubmit={sendReset}>
            <a class="back-link" href="#/logowanie">
              ← Wróć do logowania
            </a>
            <h1 class="page-title">
              Nowe <em>hasło</em>
            </h1>
            <p class="muted">Podaj e-mail, którego używasz do logowania. Wyślemy link do ustawienia nowego hasła.</p>
            <TextInput label="E-mail" type="email" autoComplete="email" value={email} onInput={setEmail} />
            <Button type="submit" block disabled={busy}>
              Wyślij link
            </Button>
            <p class="small muted">Problem z logowaniem? Napisz do osoby, która opiekuje się stroną.</p>
          </form>
        )}

        {route === 'reset/wyslano' && (
          <div class="login__form">
            <span class="label label--plum">Panel gabinetu</span>
            <h1 class="page-title">
              Sprawdź <em>skrzynkę</em>
            </h1>
            <p class="muted">
              Wysłaliśmy link na {email || DEFAULT_EMAIL}. Jest ważny przez 1 godzinę.
            </p>
            <Button variant="secondary" block href="#/logowanie">
              Wróć do logowania
            </Button>
            <p class="small muted">
              Nie widzisz wiadomości? Sprawdź folder Spam albo{' '}
              <a href="#/reset" class="inline-link">
                wyślij link jeszcze raz
              </a>
              .
            </p>
          </div>
        )}

        {route === 'logowanie' && (
          <form class="login__form" onSubmit={submit} noValidate>
            <span class="label label--plum">Panel gabinetu</span>
            <h1 class="page-title">
              Witaj <em>z powrotem</em>
            </h1>
            <p class="muted">Zaloguj się, żeby zarządzać bonami, cennikiem i treściami na stronie.</p>
            {error && (
              <p class="form-error" role="alert">
                Nieprawidłowy e-mail lub hasło. Spróbuj jeszcze raz.
              </p>
            )}
            <TextInput label="E-mail" type="email" autoComplete="username" value={email} error={error} onInput={(v) => (setEmail(v), setError(false))} />
            <TextInput label="Hasło" type="password" autoComplete="current-password" value={password} error={error} onInput={(v) => (setPassword(v), setError(false))} placeholder="••••••••••••" />
            <div class="login__options">
              <Toggle checked={remember} onChange={setRemember} label="Zapamiętaj mnie" labelVisible />
              <a class="inline-link" href="#/reset">
                Nie pamiętasz hasła?
              </a>
            </div>
            <Button type="submit" block disabled={busy}>
              Zaloguj się
            </Button>
            <p class="small muted">Problem z logowaniem? Napisz do osoby, która opiekuje się stroną.</p>
            <p class="demo-notice demo-notice--login">Prototyp: hasło to „{DEMO_PASSWORD}”.</p>
          </form>
        )}
      </main>
    </div>
  );
}
