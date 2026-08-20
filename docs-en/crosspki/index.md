# CrossPKI for CEF - Integration Guide

CrossPKI gives your Chromium application access to the digital certificates and
private keys held in the user's Windows certificate store, from JavaScript.

This guide assumes a working CEF host on Windows with your own `CefApp` and
`CefClient`. Integration is six forwarded callbacks, one source file compiled into
your host, one npm package, and one DLL deployed beside your executable.

---

## 1. What you get

| Artifact | From | How you consume it |
|---|---|---|
| `crosspki.dll` | ZIP | deployed next to your executable, loaded at runtime |
| `crosspki_cef_bridge.h` / `.cpp` | ZIP | **compiled into your application** |
| `crosspki-cef` | npm, or `js/` in the ZIP | imported by your web code |
| `crosspki.h` | ZIP | optional — only to call the C API directly |

The bridge ships as source because it must compile against your own CEF SDK and
toolset. Nothing is linked at build time — it loads the DLL at runtime.

---

## 2. Requirements

- **Windows**, **x64**. CrossPKI uses the Windows certificate store and CNG.
- **CEF.** The bridge is compiled as part of your application, so what matters is
  that it builds against your SDK. Verified with MSVC v143 against the current
  stable build of each line:

  | CEF | `/std:c++17` | `/std:c++20` |
  |---|---|---|
  | 93.1.14 | yes | no |
  | 110.0.32 | yes | yes |
  | 138.0.62 | yes | yes |
  | 149.0.6 | no | yes |

  The constraint is the language standard, not the bridge — the bridge builds under
  both. Each CEF line restricts which standard *its own* headers accept, and your
  application is already subject to that restriction: CEF 93 uses `std::result_of`,
  removed in C++20, so a CEF 93 host must compile as C++17; CEF 149 uses C++20
  concepts, so a CEF 149 host must compile as C++20; CEF 110 and 138 accept either.

  Compile the bridge with the same standard as the rest of your host. Versions
  outside this table are likely to work — a mismatch surfaces as a compile error
  during integration, never as a failure in production.

  The bridge also needs `libcef_dll_wrapper`, which your application almost
  certainly already links.
- **Node.js and npm**, for your web build.

---

## 3. Download

```
https://cdn.lacunasoftware.com/crosspki/crosspki-cef-1.0.0.zip
```

SHA-256: `56e2196289da981150c2bf73d71915bc05cad86b252fdac191fe20313e1f9787`

Every release has an immutable URL, so a given version always resolves to the same
bytes. `crosspki.dll` is Authenticode-signed by Lacuna Software — verify both the
checksum and the signature before deploying. If your environment enforces WDAC or
AppLocker, the Authenticode signature is what those policies evaluate.

---

## 4. Add the bridge to your build

1. Compile `bridge/crosspki_cef_bridge.cpp` into your host — the same target that
   builds your `CefApp` and `CefClient`.
2. Add the package root to that target's include directories, so
   `#include "bridge/crosspki_cef_bridge.h"` resolves.

Your CEF SDK include directory stays as it is; the bridge includes CEF headers by
their usual `include/...` paths.

---

## 5. Wire the renderer process

The renderer half installs the JavaScript entry point. It does **not** load the
DLL — no certificate or key code runs in a renderer.

```cpp
#include "bridge/crosspki_cef_bridge.h"

class MyApp : public CefApp,
              public CefRenderProcessHandler {
 public:
  CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() override {
    return this;
  }

  void OnContextCreated(CefRefPtr<CefBrowser> browser,
                        CefRefPtr<CefFrame> frame,
                        CefRefPtr<CefV8Context> context) override {
    crosspki_.OnContextCreated(browser, frame, context);
  }

  void OnContextReleased(CefRefPtr<CefBrowser> browser,
                         CefRefPtr<CefFrame> frame,
                         CefRefPtr<CefV8Context> context) override {
    crosspki_.OnContextReleased(browser, frame, context);
  }

  bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
                                CefRefPtr<CefFrame> frame,
                                CefProcessId source_process,
                                CefRefPtr<CefProcessMessage> message) override {
    // Return false instead if you have your own messages to handle.
    return crosspki_.OnProcessMessageReceived(browser, frame, source_process, message);
  }

 private:
  crosspki::cef::RendererBridge crosspki_;

  IMPLEMENT_REFCOUNTING(MyApp);
};
```

All three are required: `OnProcessMessageReceived` is what carries results back from
the browser process, so omitting it means calls never return.

---

## 6. Wire the browser process

The browser half owns the DLL and does the work. Construct it on the browser UI
thread, after `CefInitialize` has returned.

```cpp
#include "bridge/crosspki_cef_bridge.h"

class MyClient : public CefClient,
                 public CefLifeSpanHandler,
                 public CefRequestHandler {
 public:
  MyClient() {
    // A stable identifier for your application. Use reverse-DNS notation and keep
    // it the same across releases.
    crosspki_ = std::make_unique<crosspki::cef::BrowserBridge>("com.example.myapp");
  }

  CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
  CefRefPtr<CefRequestHandler> GetRequestHandler() override { return this; }

  bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
                                CefRefPtr<CefFrame> frame,
                                CefProcessId source_process,
                                CefRefPtr<CefProcessMessage> message) override {
    return crosspki_->OnProcessMessageReceived(browser, frame, source_process, message);
  }

  // Both of these cancel calls still in flight for the browser.
  void OnBeforeClose(CefRefPtr<CefBrowser> browser) override {
    crosspki_->OnBeforeClose(browser);
  }

  void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser,
                                 TerminationStatus status,
                                 int error_code,
                                 const CefString& error_string) override {
    crosspki_->OnRenderProcessTerminated(browser);
  }

 private:
  std::unique_ptr<crosspki::cef::BrowserBridge> crosspki_;

  IMPLEMENT_REFCOUNTING(MyClient);
};
```

Each call runs on a CEF background thread, so a slow certificate store read or a
smartcard provider's dialog cannot block your UI.

`BrowserBridge::IsAvailable()` reports whether `crosspki.dll` was found and loaded.
Check it at startup to surface a clear message instead of letting the first PKI call
fail.

---

## 7. Install the JavaScript library

```bash
npm install crosspki-cef
```

TypeScript definitions are included; no `@types` package is needed.

The package ships in three shapes, and your build picks the right one
automatically:

| Your setup | What resolves |
|---|---|
| Angular, webpack, vite, rollup, esbuild | `import { CrossPki } from 'crosspki-cef'` |
| Native ES modules, no bundler | `crosspki-cef/standalone` |
| No build step at all | `dist/crosspki.bundle.js` in a `<script>` tag, then the `CrossPkiLib` global |

If you cannot use npm, the same files are in the ZIP under `js/`.

Angular note: node-forge is a CommonJS dependency, so `ng build` may warn about
optimization bailouts. Either add `node-forge` to `allowedCommonJsDependencies` in
`angular.json`, or import the `/standalone` entry, which has it inlined.

---

## 8. Deploy

Ship `crosspki.dll` next to your host executable, alongside `libcef.dll` and the
rest of your CEF binaries. The bridge looks there first and only then falls back to
the standard search path, which is what stops a stray copy elsewhere on the machine
from being picked up instead.

There is nothing to register, no COM component, and no installer step.

---

## 9. Verify the integration

Run this from your application's web context. It exercises the whole path —
renderer, IPC, browser process, DLL — without touching the user's certificates:

```typescript
import { CrossPki, CrossPkiError } from 'crosspki-cef';

async function checkCrossPki() {
  try {
    const version = await CrossPki.getVersion();
    console.log(`CrossPKI is wired up. Native library version ${version}.`);

    const certs = await CrossPki.listCertificatesWithKey();
    console.log(`${certs.length} certificate(s) with a private key.`);
    for (const cert of certs) {
      console.log(` - ${cert.subjectDisplayName}, expires ${cert.validityEnd}`);
    }
  } catch (e) {
    if (e instanceof CrossPkiError) {
      console.error(`CrossPKI failed [${e.code}]: ${e.message}`);
    } else {
      console.error(e);
    }
  }
}
```

A machine with no certificates reports `0` — that is a correct result, not a
failure. Certificates whose private key is missing or unusable are not listed.

Every CrossPKI method returns a promise and rejects with a `CrossPkiError` carrying
a `code`. Branch on `code`, never on message text.

For the full API — signing, key generation, CSRs, PKCS#12 import, ICP-Brasil
fields — see https://docs.lacunasoftware.com/articles/crosspki.

---

## 10. Sandbox

**Keep the Chromium sandbox enabled.** The DLL loads in the browser process, never
in a renderer, precisely so your renderers can stay sandboxed. Nothing here needs
`no_sandbox` or `--single-process`. If you are working from a CEF sample that sets
`no_sandbox = true`, that belongs to the sample, not to CrossPKI.

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every call rejects with `platformNotSupported`, "native bridge not found" | The renderer half is not installed | Forward `OnContextCreated` to `RendererBridge` (section 5) |
| Calls never settle — the promise neither resolves nor rejects | A message is being dropped in one direction | Forward `OnProcessMessageReceived` in **both** the renderer handler and the browser client, and confirm a `BrowserBridge` was actually constructed |
| Calls reject with `internal`, "native bridge failure (1)" | `crosspki.dll` was not found or could not be loaded | Place the DLL next to your executable; confirm it is the x64 build and that `IsAvailable()` returns true |
| `TypeError: window.crossPkiQuery is not a function` | Your web code ran before the renderer bridge installed the entry point | Call CrossPKI after page load, not during early script evaluation |
| A certificate visible in Windows does not appear in the list | Its private key is missing or unreachable — an orphaned entry, or a token that is not connected | Expected. Only certificates with a usable key are listed |
| Signing appears to hang | The provider's smartcard PIN dialog opened behind your application window | Bring it forward from the taskbar. It has no owner window, so it can be painted behind the app |
| `algorithmNotSupported` when using SHA-224 | Windows CNG has no SHA-224 implementation | Use SHA-256 or stronger |
| `certificateNotFound` for a thumbprint that exists | The thumbprint is Base64 of the SHA-256 of the DER bytes, not a hex SHA-1 fingerprint | Use the `thumbprint` value from `listCertificatesWithKey()` verbatim |
| `wrongPassword` importing a valid PKCS#12 | The content is not valid PKCS#12, or the password is wrong | Confirm the file is a `.pfx`/`.p12` and that it is Base64-encoded before being passed in |
| `ERR_MODULE_NOT_FOUND` importing the package | An ESM loader that does not follow the `exports` map | Import `crosspki-cef/standalone`, or use the `<script>` bundle |
| The bridge does not compile, with errors inside CEF's own headers (`std::result_of`, `convertible_to`) | The C++ standard does not match what your CEF version accepts | Compile the bridge with the same `/std:` setting as the rest of your host — see section 2 |

---

## Support

Include your CrossPKI version (`CrossPki.getVersion()`), your CEF version, and your
Windows version when reporting an issue.
