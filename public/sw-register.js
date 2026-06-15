/**
 * Registra o service worker e mostra um banner "Nova versão disponível" quando
 * há uma atualização pronta. Ao tocar "Atualizar", ativa o novo SW e recarrega.
 * JS puro (independente do bundle React), injetado no index.html pelo pós-build.
 */
(function () {
  // Captura cedo o evento de instalação do PWA. O Chrome/Android dispara o
  // `beforeinstallprompt` antes do bundle React montar, então guardamos o evento
  // num global; a tela InstallGate lê window.__pwaInstall.prompt e avisa via
  // 'pwa-installable'. (Fica fora do early-return do SW: é independente dele.)
  window.__pwaInstall = window.__pwaInstall || { prompt: null };
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__pwaInstall.prompt = e;
    window.dispatchEvent(new Event('pwa-installable'));
  });
  window.addEventListener('appinstalled', function () {
    window.__pwaInstall.prompt = null;
  });

  if (!('serviceWorker' in navigator)) return;

  function showBanner(onUpdate) {
    if (document.getElementById('pwa-update-banner')) return;

    var bar = document.createElement('div');
    bar.id = 'pwa-update-banner';
    bar.setAttribute('role', 'status');
    bar.style.cssText =
      'position:fixed;left:50%;transform:translateX(-50%);' +
      'bottom:calc(16px + env(safe-area-inset-bottom, 0px));z-index:2147483647;' +
      'display:flex;align-items:center;gap:12px;max-width:calc(100% - 24px);' +
      'box-sizing:border-box;padding:12px 14px;border-radius:14px;' +
      'background:#5b6ce0;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.18);' +
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px";

    var txt = document.createElement('span');
    txt.textContent = 'Nova versão disponível';
    txt.style.cssText = 'font-weight:600';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Atualizar';
    btn.style.cssText =
      'appearance:none;-webkit-appearance:none;border:0;cursor:pointer;' +
      'background:#fff;color:#4451c4;font-weight:700;font-size:14px;' +
      'padding:8px 14px;border-radius:10px;font-family:inherit;white-space:nowrap';
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = 'Atualizando…';
      onUpdate();
    });

    bar.appendChild(txt);
    bar.appendChild(btn);
    document.body.appendChild(bar);
  }

  var updateClicked = false;
  var refreshed = false;

  // recarrega só quando o usuário pediu a atualização (evita reload na 1ª instalação)
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!updateClicked || refreshed) return;
    refreshed = true;
    window.location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (reg) {
        function promptForWaiting(worker) {
          if (!worker) return;
          showBanner(function () {
            updateClicked = true;
            worker.postMessage({ type: 'SKIP_WAITING' });
          });
        }

        // já há uma versão esperando de uma visita anterior?
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptForWaiting(reg.waiting);
        }

        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            // instalada + já existe controlador = atualização (não 1ª instalação)
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              promptForWaiting(nw);
            }
          });
        });
      })
      .catch(function () {});
  });
})();
