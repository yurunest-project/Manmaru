import Foundation
import FirebaseFirestore

struct UserProfile: Codable, Equatable {
    var displayName: String
    var coupleId: String?
    var themeId: String
    var createdAt: Date

    var resolvedTheme: ThemeID {
        ThemeID(rawValue: themeId) ?? .sakura
    }

    static func fresh(displayName: String) -> UserProfile {
        UserProfile(
            displayName: displayName.isEmpty ? "パートナー" : displayName,
            coupleId: nil,
            themeId: ThemeID.sakura.rawValue,
            createdAt: Date()
        )
    }
}
