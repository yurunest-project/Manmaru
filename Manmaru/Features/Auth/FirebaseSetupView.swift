import SwiftUI

struct FirebaseSetupView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    steps
                    PrimaryButton(title: "サンプルデータでデザインを見る", systemImage: "sparkles") {
                        model.enterDesignPreview()
                    }
                }
                .padding(24)
                .padding(.top, 40)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("まんまる")
                .font(.manmaru(.largeTitle, weight: .bold))
                .foregroundStyle(theme.text)
            Text("Firebase の設定ファイルを入れると、2人で予定を共有できます。")
                .font(.manmaru(.body))
                .foregroundStyle(theme.textSecondary)
        }
    }

    private var steps: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 16) {
                step(number: "1", text: "Firebase で iOS アプリを登録し、GoogleService-Info.plist をダウンロードする")
                step(number: "2", text: "そのファイルで Manmaru/Resources/GoogleService-Info.plist を置き換える")
                step(number: "3", text: "Authentication で Sign in with Apple を有効にする")
                step(number: "4", text: "firestore.rules をデプロイする")
            }
        }
    }

    private func step(number: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(number)
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.onPrimary)
                .frame(width: 28, height: 28)
                .background(theme.primary)
                .clipShape(Circle())
            Text(text)
                .font(.manmaru(.subheadline))
                .foregroundStyle(theme.text)
        }
    }
}
