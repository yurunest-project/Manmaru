import SwiftUI

enum ThemeID: String, CaseIterable, Identifiable, Codable {
    case sakura
    case hoshizora
    case hachimitsu

    var id: String { rawValue }
}

struct AppTheme: Identifiable, Equatable {
    let id: ThemeID
    let name: String
    let tagline: String
    let background: Color
    let surface: Color
    let surfaceMuted: Color
    let primary: Color
    let primarySoft: Color
    let accent: Color
    let text: Color
    let textSecondary: Color
    let onPrimary: Color
    let shadow: Color
    let danger: Color
    let radius: CGFloat
    let isDark: Bool

    static let sakura = AppTheme(
        id: .sakura,
        name: "さくら",
        tagline: "やわらかいピンクとクリーム",
        background: Color(hex: "FFF3F6"),
        surface: Color(hex: "FFFFFF"),
        surfaceMuted: Color(hex: "FBE4EA"),
        primary: Color(hex: "E891A3"),
        primarySoft: Color(hex: "F7C9D3"),
        accent: Color(hex: "C9A227"),
        text: Color(hex: "4A3035"),
        textSecondary: Color(hex: "8B6B72"),
        onPrimary: Color.white,
        shadow: Color(hex: "E891A3").opacity(0.18),
        danger: Color(hex: "C45C6A"),
        radius: 24,
        isDark: false
    )

    static let hoshizora = AppTheme(
        id: .hoshizora,
        name: "ほしぞら",
        tagline: "深いネイビーと氷のような青",
        background: Color(hex: "0F1724"),
        surface: Color(hex: "1A2740"),
        surfaceMuted: Color(hex: "243552"),
        primary: Color(hex: "7EB8D4"),
        primarySoft: Color(hex: "2E4A66"),
        accent: Color(hex: "D4E6F0"),
        text: Color(hex: "F0F4F8"),
        textSecondary: Color(hex: "8BA3B8"),
        onPrimary: Color(hex: "0F1724"),
        shadow: Color.black.opacity(0.35),
        danger: Color(hex: "E07A7A"),
        radius: 16,
        isDark: true
    )

    static let hachimitsu = AppTheme(
        id: .hachimitsu,
        name: "はちみつ",
        tagline: "アイボリーとテラコッタ",
        background: Color(hex: "FBF6EE"),
        surface: Color(hex: "FFFFFF"),
        surfaceMuted: Color(hex: "F3E6D4"),
        primary: Color(hex: "C4784A"),
        primarySoft: Color(hex: "E8C4A8"),
        accent: Color(hex: "8B5E3C"),
        text: Color(hex: "3D2C1E"),
        textSecondary: Color(hex: "8A7360"),
        onPrimary: Color.white,
        shadow: Color(hex: "C4784A").opacity(0.16),
        danger: Color(hex: "B54A3C"),
        radius: 20,
        isDark: false
    )

    static let all: [AppTheme] = [.sakura, .hoshizora, .hachimitsu]

    static func theme(for id: ThemeID) -> AppTheme {
        all.first { $0.id == id } ?? .sakura
    }
}

private struct AppThemeKey: EnvironmentKey {
    static let defaultValue = AppTheme.sakura
}

extension EnvironmentValues {
    var appTheme: AppTheme {
        get { self[AppThemeKey.self] }
        set { self[AppThemeKey.self] = newValue }
    }
}

extension Font {
    static func manmaru(_ style: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        .system(style, design: .rounded, weight: weight)
    }
}
