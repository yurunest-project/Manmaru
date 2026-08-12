import FirebaseFirestore
import Foundation

@MainActor
final class DateService {
    private var db: Firestore { Firestore.firestore() }
    private var listener: ListenerRegistration?

    func listen(coupleId: String, onChange: @escaping ([DatePlan]) -> Void) {
        listener?.remove()
        listener = db.collection("couples")
            .document(coupleId)
            .collection("dates")
            .order(by: "date", descending: true)
            .addSnapshotListener { snapshot, _ in
                let plans = snapshot?.documents.compactMap { try? $0.data(as: DatePlan.self) } ?? []
                Task { @MainActor in
                    onChange(plans)
                }
            }
    }

    func stop() {
        listener?.remove()
        listener = nil
    }

    func save(coupleId: String, plan: DatePlan) async throws {
        var copy = plan
        copy.updatedAt = Date()
        let collection = db.collection("couples").document(coupleId).collection("dates")
        if let id = plan.id {
            try collection.document(id).setData(from: copy)
        } else {
            if copy.createdAt.timeIntervalSince1970 == 0 {
                copy.createdAt = Date()
            }
            _ = try collection.addDocument(from: copy)
        }
    }

    func delete(coupleId: String, plan: DatePlan) async throws {
        guard let id = plan.id else { return }
        try await db.collection("couples").document(coupleId).collection("dates").document(id).delete()
    }
}
