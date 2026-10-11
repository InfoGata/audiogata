import UIKit
import Capacitor

class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        // App-local plugins are registered here; npm ones come from cap sync.
        bridge?.registerPluginInstance(PoTokenMinterPlugin())
    }
}
