import Foundation
import FirebaseCore

enum FirebaseBootstrap {
    private(set) static var isConfigured = false

    static var hasValidPlist: Bool {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let dict = NSDictionary(contentsOfFile: path),
              let appID = dict["GOOGLE_APP_ID"] as? String
        else {
            return false
        }

        let invalid = ["", "REPLACE_ME", "YOUR_GOOGLE_APP_ID"]
        return !invalid.contains(appID) && !appID.contains("REPLACE")
    }

    static func configureIfPossible() {
        guard !isConfigured, hasValidPlist else { return }
        FirebaseApp.configure()
        isConfigured = true
    }
}
