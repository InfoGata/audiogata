import Foundation
import Capacitor
import WebKit

/**
 * Mints proof-of-origin tokens in a hidden web view on the provider's origin.
 *
 * YouTube streams only about a minute of most videos to a client that cannot
 * show a token from its BotGuard check, which only yields a usable token on
 * youtube.com. The app (src/po-minter) validates the request and hands over
 * the page url, the minter config and the content binding; this loads the page
 * in a web view of its own, runs public/po-minter.js in it, and returns the
 * token. The web view is kept while tokens are being asked for and destroyed
 * after ten idle minutes. The iOS port of
 * android/app/src/main/java/com/audiogata/app/PoTokenMinterPlugin.java.
 */
@objc(PoTokenMinterPlugin)
public class PoTokenMinterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PoTokenMinterPlugin"
    public let jsName = "PoTokenMinter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "mint", returnType: CAPPluginReturnPromise)
    ]

    /** The only origins a minter page may be loaded on. */
    private static let allowedOrigins: Set<String> = ["https://www.youtube.com"]
    private static let bridgeName = "InfoGataPoMinterBridge"
    private static let loadTimeout: TimeInterval = 30
    private static let mintTimeout: TimeInterval = 45
    private static let idleDestroy: TimeInterval = 10 * 60
    /**
     * Desktop Safari, which is what this engine is: a mobile UA is sent to
     * m.youtube.com instead of the page asked for, and claiming Chrome from
     * WebKit is a mismatch BotGuard can see.
     */
    private static let userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15"

    // Everything below is only touched on the main queue.
    private var page: WKWebView?
    private var pageUrl: String?
    private var pageLoaded = false
    private var pending: [String: CAPPluginCall] = [:]
    private var waitingForLoad: [() -> Void] = []
    private var minterSource: String?
    private var destroyWhenIdle: DispatchWorkItem?
    private lazy var navigationHandler = NavigationHandler(owner: self)

    @objc func mint(_ call: CAPPluginCall) {
        guard let frameUrl = call.getString("frameUrl"),
              let config = call.getObject("config"),
              let contentBinding = call.getString("contentBinding") else {
            call.reject("frameUrl, config and contentBinding are required")
            return
        }
        guard let url = URL(string: frameUrl), url.port == nil,
              Self.allowedOrigins.contains(Self.origin(of: url)) else {
            call.reject("Cannot mint tokens on \(frameUrl)")
            return
        }

        DispatchQueue.main.async {
            self.destroyWhenIdle?.cancel()
            let destroy = DispatchWorkItem { [weak self] in self?.destroyPage() }
            self.destroyWhenIdle = destroy
            DispatchQueue.main.asyncAfter(deadline: .now() + Self.idleDestroy, execute: destroy)

            guard self.ensurePage(url) else {
                call.reject("Could not open the minter page")
                return
            }
            let run = { self.runMinter(call, config: config, contentBinding: contentBinding) }
            if self.pageLoaded { run() } else { self.waitingForLoad.append(run) }
        }
    }

    private static func origin(of url: URL) -> String {
        "\(url.scheme ?? "")://\(url.host ?? "")"
    }

    private func ensurePage(_ url: URL) -> Bool {
        if page != nil && url.absoluteString == pageUrl { return true }
        destroyPage()
        // WebKit throttles a web view that is in no window, so it sits in the
        // app's view, invisible and out of the way.
        guard let host = bridge?.viewController?.view else { return false }

        let configuration = WKWebViewConfiguration()
        // Its own cookie jar, in memory, so the page never sees the app's or
        // anyone's session.
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(
            ScriptMessageHandler(owner: self), name: Self.bridgeName)
        let view = WKWebView(frame: CGRect(x: 0, y: 0, width: 1, height: 1), configuration: configuration)
        view.customUserAgent = Self.userAgent
        view.navigationDelegate = navigationHandler
        view.alpha = 0
        view.isUserInteractionEnabled = false
        host.addSubview(view)

        page = view
        pageUrl = url.absoluteString
        pageLoaded = false
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.loadTimeout) { [weak self, weak view] in
            guard let self, let view, self.page === view, !self.pageLoaded else { return }
            self.failWaiting("The minter page did not load")
            self.destroyPage()
        }
        view.load(URLRequest(url: url))
        return true
    }

    fileprivate func pageFinished(_ view: WKWebView) {
        guard view === page, !pageLoaded else { return }
        guard let loaded = view.url, Self.allowedOrigins.contains(Self.origin(of: loaded)) else {
            failWaiting("The minter page went to \(view.url?.absoluteString ?? "nowhere")")
            destroyPage()
            return
        }
        pageLoaded = true
        let runs = waitingForLoad
        waitingForLoad.removeAll()
        runs.forEach { $0() }
    }

    fileprivate func pageFailed(_ view: WKWebView, _ error: Error) {
        guard view === page, !pageLoaded else { return }
        failWaiting("The minter page did not load: \(error.localizedDescription)")
        destroyPage()
    }

    private func runMinter(_ call: CAPPluginCall, config: JSObject, contentBinding: String) {
        guard let page else {
            call.reject("The minter page was closed")
            return
        }
        guard let source = loadMinterSource() else {
            call.reject("The minter script is missing")
            return
        }
        guard let configJson = Self.json(config),
              let bindingJson = Self.json(contentBinding) else {
            call.reject("Bad minter config")
            return
        }
        let id = UUID().uuidString
        pending[id] = call
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.mintTimeout) { [weak self] in
            self?.pending.removeValue(forKey: id)?.reject("No answer from the minter page")
        }

        // po-minter.js installs its API once and ignores being run again.
        let script = source + """

            ;(function () {
              var reply = function (r) { window.webkit.messageHandlers.\(Self.bridgeName).postMessage({ id: \(Self.json(id)!), result: r }); };
              try {
                window.__infogataPoMinter.mint(\(configJson), \(bindingJson))
                  .then(function (token) { reply({ token: token }); },
                        function (e) { reply({ error: String(e && e.message ? e.message : e) }); });
              } catch (e) { reply({ error: String(e && e.message ? e.message : e) }); }
            })();
            """
        page.evaluateJavaScript(script, completionHandler: nil)
    }

    /** Called from the minter page; only answers a mint this plugin started. */
    fileprivate func received(_ body: Any) {
        guard let message = body as? [String: Any],
              let id = message["id"] as? String,
              let call = pending.removeValue(forKey: id) else { return }
        let result = message["result"] as? [String: Any]
        if let token = result?["token"] as? String {
            call.resolve(["token": token])
        } else {
            call.reject(result?["error"] as? String ?? "Minting failed")
        }
    }

    private static func json(_ value: Any) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed]) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    private func loadMinterSource() -> String? {
        if let minterSource { return minterSource }
        let url = Bundle.main.bundleURL.appendingPathComponent("public/po-minter.js")
        minterSource = try? String(contentsOf: url, encoding: .utf8)
        return minterSource
    }

    private func failWaiting(_ message: String) {
        waitingForLoad.removeAll()
        let calls = pending.values
        pending.removeAll()
        calls.forEach { $0.reject(message) }
    }

    private func destroyPage() {
        guard let view = page else { return }
        failWaiting("The minter page was closed")
        view.stopLoading()
        view.navigationDelegate = nil
        view.configuration.userContentController.removeScriptMessageHandler(forName: Self.bridgeName)
        view.removeFromSuperview()
        page = nil
        pageUrl = nil
        pageLoaded = false
    }

    deinit {
        destroyWhenIdle?.cancel()
    }
}

/** Held weakly, so the web view's delegate doesn't keep the plugin alive. */
private class NavigationHandler: NSObject, WKNavigationDelegate {
    weak var owner: PoTokenMinterPlugin?

    init(owner: PoTokenMinterPlugin) {
        self.owner = owner
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        owner?.pageFinished(webView)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        owner?.pageFailed(webView, error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        owner?.pageFailed(webView, error)
    }
}

/** The user content controller retains its handlers; this breaks the cycle. */
private class ScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var owner: PoTokenMinterPlugin?

    init(owner: PoTokenMinterPlugin) {
        self.owner = owner
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        owner?.received(message.body)
    }
}
