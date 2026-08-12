import SwiftUI

struct SignInView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            VStack(spacing: 0) {
                Spacer()
                VStack(spacing: 18) {
                    ZStack {
                        Circle()
                            .fill(theme.primarySoft)
                            .frame(width: 140, height: 140)
                        Circle()
                            .fill(theme.primary)
                            .frame(width: 92, height: 92)
                        Image(systemName: "heart.fill")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(theme.onPrimary)
                    }

                    Text("まんまる")
                        .font(.manmaru(.largeTitle, weight: .bold))
                        .foregroundStyle(theme.text)

                    Text("ふたりの次のデートを、\nいちばん近くに。")
                        .font(.manmaru(.title3))
                        .foregroundStyle(theme.textSecondary)
                        .multilineTextAlignment(.center)
                }
                Spacer()

                VStack(spacing: 16) {
                    AppleSignInButton(style: theme.isDark ? .white : .black) {
                        Task { await model.signInWithApple() }
                    }
                    .frame(height: 52)
                    .padding(.horizontal, 8)

                    if model.isBusy {
                        ProgressView()
                            .tint(theme.primary)
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 48)
            }
        }
    }
}
