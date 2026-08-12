import SwiftUI
import UIKit

struct PairingView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @State private var code = ""
    @State private var mode: Mode = .choose

    private enum Mode {
        case choose
        case join
    }

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            VStack(spacing: 24) {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "link.circle.fill")
                        .font(.system(size: 56))
                        .foregroundStyle(theme.primary)
                    Text("ふたりをつなぐ")
                        .font(.manmaru(.largeTitle, weight: .bold))
                        .foregroundStyle(theme.text)
                    Text("招待コードを発行するか、\n相手のコードを入力してください。")
                        .font(.manmaru(.body))
                        .foregroundStyle(theme.textSecondary)
                        .multilineTextAlignment(.center)
                }

                if let couple = model.couple, model.profile?.coupleId != nil {
                    waitingCard(couple.inviteCode)
                } else {
                    switch mode {
                    case .choose:
                        chooseButtons
                    case .join:
                        joinForm
                    }
                }

                Spacer()

                Button("ログアウト") {
                    model.signOut()
                }
                .font(.manmaru(.subheadline, weight: .semibold))
                .foregroundStyle(theme.textSecondary)
                .padding(.bottom, 28)
            }
            .padding(.horizontal, 24)
        }
    }

    private var chooseButtons: some View {
        VStack(spacing: 12) {
            PrimaryButton(title: "招待コードを発行する", systemImage: "sparkle", isLoading: model.isBusy) {
                Task { await model.createCouple() }
            }
            SecondaryButton(title: "コードを入力する", systemImage: "keyboard") {
                mode = .join
            }
        }
    }

    private var joinForm: some View {
        VStack(spacing: 12) {
            TextField("6桁のコード", text: $code)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
                .multilineTextAlignment(.center)
                .font(.manmaru(.title, weight: .bold))
                .padding()
                .background(theme.surface)
                .clipShape(RoundedRectangle(cornerRadius: theme.radius, style: .continuous))
                .onChange(of: code) { _, newValue in
                    let allowed = Set("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
                    code = String(newValue.uppercased().filter { allowed.contains($0) }.prefix(6))
                }

            PrimaryButton(title: "このコードでつながる", systemImage: "heart.fill", isLoading: model.isBusy) {
                Task { await model.joinCouple(code: code) }
            }
            .disabled(code.count != 6)

            Button("戻る") { mode = .choose }
                .font(.manmaru(.subheadline, weight: .semibold))
                .foregroundStyle(theme.textSecondary)
        }
    }

    private func waitingCard(_ inviteCode: String) -> some View {
        AppCard {
            VStack(spacing: 12) {
                Text("相手にこのコードを送ってください")
                    .font(.manmaru(.subheadline))
                    .foregroundStyle(theme.textSecondary)
                Text(inviteCode)
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .tracking(6)
                    .foregroundStyle(theme.text)
                Button("コピー") {
                    UIPasteboard.general.string = inviteCode
                    Haptics.success()
                }
                .font(.manmaru(.subheadline, weight: .semibold))
                .foregroundStyle(theme.primary)
            }
            .frame(maxWidth: .infinity)
        }
    }
}
