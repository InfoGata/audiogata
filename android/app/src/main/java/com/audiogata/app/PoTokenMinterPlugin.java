package com.audiogata.app;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.ProfileStore;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Mints proof-of-origin tokens in a hidden WebView on the provider's origin.
 *
 * YouTube streams only about a minute of most videos to a client that cannot
 * show a token from its BotGuard check, which only yields a usable token on
 * youtube.com. The app (src/po-minter) validates the request and hands over
 * the page url, the minter config and the content binding; this loads the page
 * in a WebView of its own, runs public/po-minter.js in it, and returns the
 * token. The WebView is kept while tokens are being asked for and destroyed
 * after ten idle minutes.
 */
@CapacitorPlugin(name = "PoTokenMinter")
public class PoTokenMinterPlugin extends Plugin {
    /** The only origins a minter page may be loaded on. */
    private static final Set<String> ALLOWED_ORIGINS = Set.of("https://www.youtube.com");
    /** Its own cookie jar, so the page never sees the app's or anyone's session. */
    private static final String PROFILE = "po-minter";
    private static final String BRIDGE = "InfoGataPoMinterBridge";
    private static final long LOAD_TIMEOUT_MS = 30_000;
    private static final long MINT_TIMEOUT_MS = 45_000;
    private static final long IDLE_DESTROY_MS = 10 * 60_000;

    private final Handler main = new Handler(Looper.getMainLooper());
    private final Map<String, PluginCall> pending = new HashMap<>();
    private final List<Runnable> waitingForLoad = new ArrayList<>();

    private WebView page;
    private String pageUrl;
    private boolean pageLoaded;
    private String minterSource;
    private final Runnable destroyWhenIdle = this::destroyPage;

    @PluginMethod
    public void mint(PluginCall call) {
        String frameUrl = call.getString("frameUrl");
        JSObject config = call.getObject("config");
        String contentBinding = call.getString("contentBinding");
        if (frameUrl == null || config == null || contentBinding == null) {
            call.reject("frameUrl, config and contentBinding are required");
            return;
        }
        Uri uri = Uri.parse(frameUrl);
        String origin = uri.getScheme() + "://" + uri.getHost();
        if (uri.getPort() != -1 || !ALLOWED_ORIGINS.contains(origin)) {
            call.reject("Cannot mint tokens on " + frameUrl);
            return;
        }

        main.post(() -> {
            main.removeCallbacks(destroyWhenIdle);
            main.postDelayed(destroyWhenIdle, IDLE_DESTROY_MS);
            try {
                ensurePage(frameUrl);
            } catch (RuntimeException e) {
                call.reject("Could not open the minter page: " + e.getMessage());
                return;
            }
            Runnable run = () -> runMinter(call, config, contentBinding);
            if (pageLoaded) run.run();
            else waitingForLoad.add(run);
        });
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void ensurePage(String frameUrl) {
        if (page != null && frameUrl.equals(pageUrl)) return;
        destroyPage();

        WebView view = new WebView(getContext());
        if (WebViewFeature.isFeatureSupported(WebViewFeature.MULTI_PROFILE)) {
            ProfileStore.getInstance().getOrCreateProfile(PROFILE);
            WebViewCompat.setProfile(view, PROFILE);
        }
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setUserAgentString(desktopUserAgent(settings.getUserAgentString()));
        view.addJavascriptInterface(new Bridge(), BRIDGE);
        view.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView v, String url) {
                if (v != page || pageLoaded) return;
                Uri loaded = Uri.parse(url);
                if (!ALLOWED_ORIGINS.contains(loaded.getScheme() + "://" + loaded.getHost())) {
                    failWaiting("The minter page went to " + url);
                    destroyPage();
                    return;
                }
                pageLoaded = true;
                List<Runnable> runs = new ArrayList<>(waitingForLoad);
                waitingForLoad.clear();
                for (Runnable run : runs) run.run();
            }
        });

        page = view;
        pageUrl = frameUrl;
        pageLoaded = false;
        main.postDelayed(() -> {
            if (page == view && !pageLoaded) {
                failWaiting("The minter page did not load");
                destroyPage();
            }
        }, LOAD_TIMEOUT_MS);
        view.loadUrl(frameUrl);
    }

    /**
     * Desktop Chrome with the WebView's own Chrome version. The WebView's UA
     * marks it as a WebView ("; wv"), and a mobile UA is sent to m.youtube.com
     * instead of the page asked for. This is the UA the desktop app mints with;
     * whether YouTube accepts it from Android is not yet verified on a device.
     */
    private static String desktopUserAgent(String webViewUa) {
        String chrome = "Chrome/120.0.0.0";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("Chrome/[\\d.]+").matcher(webViewUa);
        if (m.find()) chrome = m.group();
        return "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " + chrome + " Safari/537.36";
    }

    private void runMinter(PluginCall call, JSObject config, String contentBinding) {
        String source;
        try {
            source = loadMinterSource();
        } catch (IOException e) {
            call.reject("The minter script is missing: " + e.getMessage());
            return;
        }
        String id = UUID.randomUUID().toString();
        pending.put(id, call);
        main.postDelayed(() -> {
            PluginCall timedOut = pending.remove(id);
            if (timedOut != null) timedOut.reject("No answer from the minter page");
        }, MINT_TIMEOUT_MS);

        // po-minter.js installs its API once and ignores being run again.
        String script = source + "\n;(function () {\n"
                + "  var reply = function (r) { " + BRIDGE + ".resolve(" + JSONObject.quote(id) + ", JSON.stringify(r)); };\n"
                + "  try {\n"
                + "    window.__infogataPoMinter.mint(" + config + ", " + JSONObject.quote(contentBinding) + ")\n"
                + "      .then(function (token) { reply({ token: token }); },\n"
                + "            function (e) { reply({ error: String(e && e.message ? e.message : e) }); });\n"
                + "  } catch (e) { reply({ error: String(e && e.message ? e.message : e) }); }\n"
                + "})();";
        page.evaluateJavascript(script, null);
    }

    private String loadMinterSource() throws IOException {
        if (minterSource != null) return minterSource;
        try (InputStream in = getContext().getAssets().open("public/po-minter.js")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            for (int n; (n = in.read(buffer)) != -1; ) out.write(buffer, 0, n);
            minterSource = out.toString(StandardCharsets.UTF_8.name());
        }
        return minterSource;
    }

    private void failWaiting(String message) {
        waitingForLoad.clear();
        for (PluginCall call : pending.values()) call.reject(message);
        pending.clear();
    }

    private void destroyPage() {
        if (page == null) return;
        failWaiting("The minter page was closed");
        page.removeJavascriptInterface(BRIDGE);
        page.destroy();
        page = null;
        pageUrl = null;
        pageLoaded = false;
    }

    @Override
    protected void handleOnDestroy() {
        main.removeCallbacks(destroyWhenIdle);
        destroyPage();
    }

    /** Called from the minter page; only answers a mint this plugin started. */
    private class Bridge {
        @JavascriptInterface
        public void resolve(String id, String json) {
            main.post(() -> {
                PluginCall call = pending.remove(id);
                if (call == null) return;
                try {
                    JSONObject result = new JSONObject(json);
                    if (result.has("token")) {
                        JSObject ret = new JSObject();
                        ret.put("token", result.getString("token"));
                        call.resolve(ret);
                    } else {
                        call.reject(result.optString("error", "Minting failed"));
                    }
                } catch (Exception e) {
                    call.reject("Bad answer from the minter page");
                }
            });
        }
    }
}
