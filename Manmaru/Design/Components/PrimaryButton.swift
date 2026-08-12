import SwiftUI

struct PrimaryButton: View {
    @Environment(\.appTheme) private var theme
    let title: String
    var systemImage: String? = nil
    var isLoading: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(theme.onPrimary)
                } else if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title)
                    .font(.manmaru(.headline, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .foregroundStyle(theme.onPrimary)
            .background(theme.primary)
            .clipShape(RoundedRectangle(cornerRadius: theme.radius - 6, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(isLoading)
    }
}

struct SecondaryButton: View {
    @Environment(\.appTheme) private var theme
    let title: String
    var systemImage: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title)
                    .font(.manmaru(.headline, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .foregroundStyle(theme.primary)
            .background(theme.primarySoft.opacity(theme.isDark ? 0.7 : 1))
            .clipShape(RoundedRectangle(cornerRadius: theme.radius - 6, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}
