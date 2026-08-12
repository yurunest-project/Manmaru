import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        Group {
            switch model.route {
            case .loading:
                LoadingView()
            case .needsFirebaseSetup:
                FirebaseSetupView()
            case .signedOut:
                SignInView()
            case .needsPairing:
                PairingView()
            case .main:
                MainTabView()
            }
        }
        .environment(\.appTheme, model.theme)
        .preferredColorScheme(model.theme.isDark ? .dark : .light)
        .tint(model.theme.primary)
        .animation(.easeInOut(duration: 0.28), value: model.route)
        .alert("うまくいきませんでした", isPresented: errorVisible) {
            Button("OK", role: .cancel) { model.errorMessage = nil }
        } message: {
            Text(model.errorMessage ?? "")
        }
    }

    private var errorVisible: Binding<Bool> {
        Binding(
            get: { model.errorMessage != nil },
            set: { if !$0 { model.errorMessage = nil } }
        )
    }
}

private struct LoadingView: View {
    @Environment(\.appTheme) private var theme

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            VStack(spacing: 16) {
                Circle()
                    .fill(theme.primary)
                    .frame(width: 88, height: 88)
                    .overlay {
                        Circle()
                            .stroke(theme.accent.opacity(0.7), lineWidth: 3)
                            .padding(8)
                    }
                Text("まんまる")
                    .font(.manmaru(.largeTitle, weight: .bold))
                    .foregroundStyle(theme.text)
            }
        }
    }
}
