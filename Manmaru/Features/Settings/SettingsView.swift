import SwiftUI
import UIKit

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @State private var confirmLeave = false
    @State private var copied = false

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        themeSection
                        pairSection
                        accountSection
                        Color.clear.frame(height: 96)
                    }
                    .padding(20)
                }
            }
            .navigationTitle("設定")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(theme.background, for: .navigationBar)
            .alert("ペアを解除しますか？", isPresented: $confirmLeave) {
                Button("解除する", role: .destructive) {
                    Task { await model.leaveCouple() }
                }
                Button("キャンセル", role: .cancel) {}
            } message: {
                Text("相手との共有が切れます。予定データは、残った一人がいるあいだ保持されます。")
            }
        }
    }

    private var themeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("デザイン")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)

            ForEach(AppTheme.all) { item in
                Button {
                    Task { await model.setTheme(item.id) }
                } label: {
                    HStack(spacing: 14) {
                        HStack(spacing: 6) {
                            Circle().fill(item.primary).frame(width: 18, height: 18)
                            Circle().fill(item.accent).frame(width: 18, height: 18)
                            Circle().fill(item.background).frame(width: 18, height: 18)
                                .overlay(Circle().stroke(item.text.opacity(0.2), lineWidth: 1))
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.name)
                                .font(.manmaru(.headline, weight: .semibold))
                                .foregroundStyle(theme.text)
                            Text(item.tagline)
                                .font(.manmaru(.caption))
                                .foregroundStyle(theme.textSecondary)
                        }
                        Spacer()
                        if model.themeID == item.id {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(theme.primary)
                        }
                    }
                    .padding(16)
                    .background(theme.surface)
                    .clipShape(RoundedRectangle(cornerRadius: theme.radius, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: theme.radius, style: .continuous)
                            .stroke(model.themeID == item.id ? theme.primary : Color.clear, lineWidth: 2)
                    }
                    .shadow(color: theme.shadow, radius: 12, x: 0, y: 6)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var pairSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ふたりのつながり")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)

            AppCard {
                VStack(alignment: .leading, spacing: 12) {
                    if let couple = model.couple {
                        Text("招待コード")
                            .font(.manmaru(.caption, weight: .semibold))
                            .foregroundStyle(theme.textSecondary)
                        HStack {
                            Text(couple.inviteCode)
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .tracking(4)
                                .foregroundStyle(theme.text)
                            Spacer()
                            Button(copied ? "コピー済み" : "コピー") {
                                UIPasteboard.general.string = couple.inviteCode
                                copied = true
                                Haptics.success()
                            }
                            .font(.manmaru(.subheadline, weight: .semibold))
                            .foregroundStyle(theme.primary)
                        }
                        Text(couple.memberIds.count >= 2 ? "2人でつながっています" : "相手の参加を待っています")
                            .font(.manmaru(.subheadline))
                            .foregroundStyle(theme.textSecondary)
                    } else {
                        Text("まだペアがありません")
                            .foregroundStyle(theme.textSecondary)
                    }
                }
            }

            if model.couple != nil {
                Button(role: .destructive) {
                    confirmLeave = true
                } label: {
                    Text("ペアを解除")
                        .font(.manmaru(.headline, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .foregroundStyle(theme.danger)
                        .background(theme.surface)
                        .clipShape(RoundedRectangle(cornerRadius: theme.radius - 6, style: .continuous))
                }
            }
        }
    }

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("アカウント")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)

            AppCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text(model.profile?.displayName ?? "パートナー")
                        .font(.manmaru(.headline, weight: .semibold))
                        .foregroundStyle(theme.text)
                    if model.isPreviewMode {
                        Text("サンプル表示中です。Firebase を設定すると2人で共有できます。")
                            .font(.manmaru(.caption))
                            .foregroundStyle(theme.textSecondary)
                    }
                }
            }

            Button {
                if model.isPreviewMode {
                    model.route = .needsFirebaseSetup
                    model.isPreviewMode = false
                } else {
                    model.signOut()
                }
            } label: {
                Text(model.isPreviewMode ? "サンプルを終了" : "ログアウト")
                    .font(.manmaru(.headline, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .foregroundStyle(theme.text)
                    .background(theme.surface)
                    .clipShape(RoundedRectangle(cornerRadius: theme.radius - 6, style: .continuous))
            }
        }
    }
}
