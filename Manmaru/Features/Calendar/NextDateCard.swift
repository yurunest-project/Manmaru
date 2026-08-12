import SwiftUI

struct NextDateCard: View {
    @Environment(\.appTheme) private var theme
    let plan: DatePlan?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            AppCard {
                if let plan {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("次のデート")
                            .font(.manmaru(.subheadline, weight: .semibold))
                            .foregroundStyle(theme.accent)
                        Text(DateFormatting.fullDate(plan.date))
                            .font(.manmaru(.largeTitle, weight: .bold))
                            .foregroundStyle(theme.text)
                        HStack(spacing: 10) {
                            countdownChip
                            Text(plan.displayTitle)
                                .font(.manmaru(.headline, weight: .semibold))
                                .foregroundStyle(theme.text)
                                .lineLimit(1)
                        }
                    }
                } else {
                    EmptyStateView(
                        symbol: "calendar.badge.plus",
                        title: "次のデートはまだないよ",
                        message: "カレンダーの日付をタップして登録しよう"
                    )
                }
            }
            .overlay {
                RoundedRectangle(cornerRadius: theme.radius, style: .continuous)
                    .stroke(theme.primary.opacity(0.18), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
    }

    private var countdownChip: some View {
        Text(plan.map { DateFormatting.countdownLabel(to: $0.date) } ?? "")
            .font(.manmaru(.caption, weight: .bold))
            .foregroundStyle(theme.onPrimary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(theme.primary)
            .clipShape(Capsule())
    }
}
