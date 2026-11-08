// Schriften lokal gebündelt: Chakra Petch (Überschriften, Labels), Atkinson Hyperlegible (Fließtext).
import '@fontsource/chakra-petch/latin-500.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400-italic.css';
import './styles/main.css';
import { bootstrap } from './app/bootstrap';

bootstrap().catch((error) => {
  console.error(error);
  const ui = document.getElementById('ui');
  if (ui) ui.innerHTML = `<div class="screen"><p class="boot-warn">Fehler beim Start: ${String(error?.message ?? error).replace(/</g, '&lt;')}</p></div>`;
});
