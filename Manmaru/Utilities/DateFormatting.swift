import Foundation

enum DateFormatting {
    static let japanese: Locale = Locale(identifier: "ja_JP")

    static func monthTitle(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = japanese
        formatter.dateFormat = "yyyy年M月"
        return formatter.string(from: date)
    }

    static func fullDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = japanese
        formatter.dateFormat = "M月d日（E）"
        return formatter.string(from: date)
    }

    static func weekdaySymbols() -> [String] {
        ["日", "月", "火", "水", "木", "金", "土"]
    }

    static func daysUntil(_ date: Date, from now: Date = Date()) -> Int {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: now)
        let target = calendar.startOfDay(for: date)
        return calendar.dateComponents([.day], from: start, to: target).day ?? 0
    }

    static func countdownLabel(to date: Date) -> String {
        let days = daysUntil(date)
        switch days {
        case ...(-1):
            return "終了"
        case 0:
            return "今日"
        case 1:
            return "明日"
        default:
            return "あと\(days)日"
        }
    }
}

extension Date {
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    func isSameDay(as other: Date) -> Bool {
        Calendar.current.isDate(self, inSameDayAs: other)
    }
}
