import FirebaseAuth
import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    var route: AppRoute = .loading
    var selectedTab: MainTab = .calendar
    var profile: UserProfile?
    var couple: CoupleProfile?
    var dates: [DatePlan] = []
    var errorMessage: String?
    var isBusy = false
    var isPreviewMode = false

    var themeID: ThemeID = .sakura
    var theme: AppTheme { AppTheme.theme(for: themeID) }

    var nextDate: DatePlan? {
        let start = Date().startOfDay
        return dates
            .filter { $0.date.startOfDay >= start }
            .sorted { $0.date < $1.date }
            .first
    }

    var sortedDatesNewestFirst: [DatePlan] {
        dates.sorted { $0.date > $1.date }
    }

    private let authService = AuthService()
    private let coupleService = CoupleService()
    private let dateService = DateService()
    private var currentUID: String?

    func start() async {
        FirebaseBootstrap.configureIfPossible()
        guard FirebaseBootstrap.isConfigured else {
            if !isPreviewMode {
                route = .needsFirebaseSetup
            }
            return
        }
        authService.start { [weak self] user in
            Task { await self?.handleAuthChange(user) }
        }
    }

    func signInWithApple() async {
        isBusy = true
        defer { isBusy = false }
        do {
            let result = try await authService.signInWithApple()
            _ = try await coupleService.ensureUserDocument(uid: result.uid, displayName: result.displayName)
        } catch AuthServiceError.cancelled {
            return
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() {
        do {
            try authService.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createCouple() async {
        guard let uid = currentUID else { return }
        isBusy = true
        defer { isBusy = false }
        do {
            couple = try await coupleService.createCouple(uid: uid)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func joinCouple(code: String) async {
        guard let uid = currentUID else { return }
        isBusy = true
        defer { isBusy = false }
        do {
            try await coupleService.joinCouple(uid: uid, code: code)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func leaveCouple() async {
        if isPreviewMode {
            couple = nil
            dates = []
            route = .needsFirebaseSetup
            isPreviewMode = false
            return
        }
        guard let uid = currentUID, let couple else { return }
        isBusy = true
        defer { isBusy = false }
        do {
            try await coupleService.leaveCouple(uid: uid, couple: couple)
            self.couple = nil
            dates = []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func setTheme(_ id: ThemeID) async {
        themeID = id
        Haptics.light()
        guard !isPreviewMode, let uid = currentUID else { return }
        do {
            try await coupleService.updateTheme(uid: uid, themeID: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveDate(_ plan: DatePlan) async {
        if isPreviewMode {
            var copy = plan
            if copy.id == nil { copy.id = UUID().uuidString }
            copy.updatedAt = Date()
            if let index = dates.firstIndex(where: { $0.id == copy.id }) {
                dates[index] = copy
            } else {
                dates.insert(copy, at: 0)
            }
            Haptics.success()
            return
        }

        guard let coupleId = couple?.id ?? profile?.coupleId else { return }
        do {
            try await dateService.save(coupleId: coupleId, plan: plan)
            Haptics.success()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteDate(_ plan: DatePlan) async {
        if isPreviewMode {
            dates.removeAll { $0.id == plan.id }
            return
        }
        guard let coupleId = couple?.id ?? profile?.coupleId else { return }
        do {
            try await dateService.delete(coupleId: coupleId, plan: plan)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func dates(on day: Date) -> [DatePlan] {
        dates.filter { $0.date.isSameDay(as: day) }.sorted { $0.date < $1.date }
    }

    func enterDesignPreview() {
        isPreviewMode = true
        profile = UserProfile(displayName: "ゆう", coupleId: "preview", themeId: ThemeID.sakura.rawValue, createdAt: Date())
        couple = CoupleProfile(id: "preview", inviteCode: "HONEY1", memberIds: ["preview-1", "preview-2"], createdAt: Date())
        dates = DatePlan.samples
        themeID = .sakura
        route = .main
    }

    private func handleAuthChange(_ user: User?) async {
        coupleService.stopAll()
        dateService.stop()
        currentUID = user?.uid
        couple = nil
        dates = []

        guard let user else {
            profile = nil
            route = .signedOut
            return
        }

        do {
            let ensured = try await coupleService.ensureUserDocument(uid: user.uid, displayName: user.displayName ?? "")
            profile = ensured
            themeID = ensured.resolvedTheme
            coupleService.listenUser(uid: user.uid) { [weak self] profile in
                self?.apply(profile: profile)
            }
        } catch {
            errorMessage = error.localizedDescription
            route = .signedOut
        }
    }

    private func apply(profile: UserProfile?) {
        self.profile = profile
        guard let profile else {
            route = .signedOut
            return
        }
        themeID = profile.resolvedTheme

        if let coupleId = profile.coupleId, !coupleId.isEmpty {
            coupleService.listenCouple(coupleId: coupleId) { [weak self] couple in
                self?.couple = couple
            }
            dateService.listen(coupleId: coupleId) { [weak self] plans in
                self?.dates = plans
            }
            route = .main
        } else {
            coupleService.stopCoupleListener()
            dateService.stop()
            couple = nil
            dates = []
            route = .needsPairing
        }
    }
}
