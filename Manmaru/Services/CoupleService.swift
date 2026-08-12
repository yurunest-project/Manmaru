import FirebaseFirestore
import Foundation

enum CoupleServiceError: LocalizedError {
    case notSignedIn
    case invalidCode
    case coupleFull
    case alreadyPaired
    case missingCouple

    var errorDescription: String? {
        switch self {
        case .notSignedIn: "ログインしていません。"
        case .invalidCode: "その招待コードは見つかりませんでした。"
        case .coupleFull: "すでに2人つながっています。"
        case .alreadyPaired: "すでにペアが設定されています。"
        case .missingCouple: "ペア情報が見つかりません。"
        }
    }
}

@MainActor
final class CoupleService {
    private var db: Firestore { Firestore.firestore() }
    private var userListener: ListenerRegistration?
    private var coupleListener: ListenerRegistration?

    func listenUser(uid: String, onChange: @escaping (UserProfile?) -> Void) {
        userListener?.remove()
        userListener = db.collection("users").document(uid).addSnapshotListener { snapshot, _ in
            let profile = try? snapshot?.data(as: UserProfile.self)
            Task { @MainActor in
                onChange(profile)
            }
        }
    }

    func listenCouple(coupleId: String, onChange: @escaping (CoupleProfile?) -> Void) {
        coupleListener?.remove()
        coupleListener = db.collection("couples").document(coupleId).addSnapshotListener { snapshot, _ in
            let couple = try? snapshot?.data(as: CoupleProfile.self)
            Task { @MainActor in
                onChange(couple)
            }
        }
    }

    func stopCoupleListener() {
        coupleListener?.remove()
        coupleListener = nil
    }

    func stopAll() {
        userListener?.remove()
        coupleListener?.remove()
        userListener = nil
        coupleListener = nil
    }

    func ensureUserDocument(uid: String, displayName: String) async throws -> UserProfile {
        let ref = db.collection("users").document(uid)
        let snapshot = try await ref.getDocument()
        if snapshot.exists, let existing = try? snapshot.data(as: UserProfile.self) {
            if existing.displayName == "パートナー", !displayName.isEmpty {
                try await ref.updateData(["displayName": displayName])
                var updated = existing
                updated.displayName = displayName
                return updated
            }
            return existing
        }

        let profile = UserProfile.fresh(displayName: displayName)
        try ref.setData(from: profile)
        return profile
    }

    func updateTheme(uid: String, themeID: ThemeID) async throws {
        try await db.collection("users").document(uid).updateData([
            "themeId": themeID.rawValue
        ])
    }

    func createCouple(uid: String) async throws -> CoupleProfile {
        let userRef = db.collection("users").document(uid)
        let userSnap = try await userRef.getDocument()
        if let profile = try? userSnap.data(as: UserProfile.self), profile.coupleId != nil {
            throw CoupleServiceError.alreadyPaired
        }

        var code = InviteCodeGenerator.make()
        for _ in 0..<8 {
            let existing = try await db.collection("inviteCodes").document(code).getDocument()
            if existing.exists {
                code = InviteCodeGenerator.make()
            } else {
                break
            }
        }

        let coupleRef = db.collection("couples").document()
        let couple = CoupleProfile(
            id: coupleRef.documentID,
            inviteCode: code,
            memberIds: [uid],
            createdAt: Date()
        )
        try coupleRef.setData(from: couple)
        try await db.collection("inviteCodes").document(code).setData([
            "coupleId": coupleRef.documentID,
            "createdAt": Timestamp(date: Date())
        ])
        try await userRef.updateData(["coupleId": coupleRef.documentID])
        return couple
    }

    func joinCouple(uid: String, code rawCode: String) async throws {
        let code = rawCode.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard code.count == 6 else { throw CoupleServiceError.invalidCode }

        let userRef = db.collection("users").document(uid)
        let userSnap = try await userRef.getDocument()
        if let profile = try? userSnap.data(as: UserProfile.self), profile.coupleId != nil {
            throw CoupleServiceError.alreadyPaired
        }

        let inviteSnap = try await db.collection("inviteCodes").document(code).getDocument()
        guard let coupleId = inviteSnap.data()?["coupleId"] as? String else {
            throw CoupleServiceError.invalidCode
        }

        let coupleRef = db.collection("couples").document(coupleId)
        let coupleSnap = try await coupleRef.getDocument()
        guard var couple = try? coupleSnap.data(as: CoupleProfile.self) else {
            throw CoupleServiceError.missingCouple
        }
        if couple.memberIds.contains(uid) {
            try await userRef.updateData(["coupleId": coupleId])
            return
        }
        if couple.isFull {
            throw CoupleServiceError.coupleFull
        }

        couple.memberIds.append(uid)
        try await coupleRef.updateData(["memberIds": couple.memberIds])
        try await userRef.updateData(["coupleId": coupleId])
    }

    func leaveCouple(uid: String, couple: CoupleProfile) async throws {
        guard let coupleId = couple.id else { throw CoupleServiceError.missingCouple }
        let remaining = couple.memberIds.filter { $0 != uid }
        let coupleRef = db.collection("couples").document(coupleId)

        try await db.collection("users").document(uid).updateData([
            "coupleId": FieldValue.delete()
        ])

        if remaining.isEmpty {
            let dates = try await coupleRef.collection("dates").getDocuments()
            for doc in dates.documents {
                try await doc.reference.delete()
            }
            try await db.collection("inviteCodes").document(couple.inviteCode).delete()
            try await coupleRef.delete()
        } else {
            try await coupleRef.updateData(["memberIds": remaining])
        }
    }
}
