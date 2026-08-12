import Foundation
import FirebaseFirestore

struct DatePlan: Identifiable, Codable, Hashable {
    @DocumentID var id: String?
    var date: Date
    var title: String
    var memo: String
    var destinations: [Destination]
    var createdAt: Date
    var updatedAt: Date

    var stableID: String { id ?? "unsaved" }

    var displayTitle: String {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "デート" : trimmed
    }

    static func blank(on day: Date = Date()) -> DatePlan {
        DatePlan(
            id: UUID().uuidString,
            date: Calendar.current.startOfDay(for: day),
            title: "",
            memo: "",
            destinations: [],
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}

extension DatePlan {
    static let samples: [DatePlan] = {
        let calendar = Calendar.current
        func day(_ year: Int, _ month: Int, _ day: Int) -> Date {
            calendar.date(from: DateComponents(year: year, month: month, day: day)) ?? Date()
        }

        return [
            DatePlan(
                id: "sample-1",
                date: day(2026, 8, 15),
                title: "水族館デート",
                memo: "午後からゆっくり。ペンギンのショーを見たい。",
                destinations: [
                    Destination(
                        name: "サンシャイン水族館",
                        address: "東京都豊島区東池袋3-1-3",
                        latitude: 35.7290,
                        longitude: 139.7195
                    )
                ],
                createdAt: Date(),
                updatedAt: Date()
            ),
            DatePlan(
                id: "sample-2",
                date: day(2026, 8, 23),
                title: "カフェ巡り",
                memo: "駅から歩けるお店を2軒。",
                destinations: [
                    Destination(
                        name: "星乃珈琲店 吉祥寺店",
                        address: "東京都武蔵野市吉祥寺本町1-8-10",
                        latitude: 35.7032,
                        longitude: 139.5798
                    ),
                    Destination(
                        name: "井の頭恩賜公園",
                        address: "東京都武蔵野市御殿山1-18-31",
                        latitude: 35.7002,
                        longitude: 139.5800
                    )
                ],
                createdAt: Date(),
                updatedAt: Date()
            ),
            DatePlan(
                id: "sample-3",
                date: day(2026, 9, 5),
                title: "映画とディナー",
                memo: "夜は予約済み。",
                destinations: [
                    Destination(
                        name: "TOHOシネマズ 新宿",
                        address: "東京都新宿区歌舞伎町1-19-1",
                        latitude: 35.6954,
                        longitude: 139.7020
                    )
                ],
                createdAt: Date(),
                updatedAt: Date()
            ),
            DatePlan(
                id: "sample-4",
                date: day(2026, 7, 20),
                title: "花火",
                memo: "楽しかった！来年も行きたい。",
                destinations: [],
                createdAt: Date(),
                updatedAt: Date()
            )
        ]
    }()
}
