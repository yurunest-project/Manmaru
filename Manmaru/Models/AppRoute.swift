import Foundation

enum AppRoute: Equatable {
    case loading
    case needsFirebaseSetup
    case signedOut
    case needsPairing
    case main
}

enum MainTab: String, CaseIterable, Identifiable {
    case calendar
    case schedule
    case settings

    var id: String { rawValue }

    var title: String {
        switch self {
        case .calendar: "カレンダー"
        case .schedule: "予定"
        case .settings: "設定"
        }
    }

    var symbol: String {
        switch self {
        case .calendar: "calendar"
        case .schedule: "list.bullet"
        case .settings: "gearshape"
        }
    }
}
