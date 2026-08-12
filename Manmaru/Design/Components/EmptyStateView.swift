import SwiftUI

struct EmptyStateView: View {
    @Environment(\.appTheme) private var theme
    let symbol: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 40, weight: .semibold, design: .rounded))
                .foregroundStyle(theme.primary)
                .frame(width: 84, height: 84)
                .background(theme.primarySoft.opacity(theme.isDark ? 0.55 : 1))
                .clipShape(Circle())

            Text(title)
                .font(.manmaru(.title3, weight: .bold))
                .foregroundStyle(theme.text)

            Text(message)
                .font(.manmaru(.subheadline))
                .foregroundStyle(theme.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
    }
}
