import Foundation
import FirebaseFirestore

struct CoupleProfile: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    var inviteCode: String
    var memberIds: [String]
    var createdAt: Date

    var isFull: Bool { memberIds.count >= 2 }
}
