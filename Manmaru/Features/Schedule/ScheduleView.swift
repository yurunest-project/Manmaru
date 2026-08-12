import SwiftUI

struct ScheduleView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @State private var detailPlan: DatePlan?
    @State private var editorPlan: DatePlan?

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                if model.sortedDatesNewestFirst.isEmpty {
                    VStack {
                        EmptyStateView(
                            symbol: "heart.text.square",
                            title: "予定はまだないよ",
                            message: "右上の＋から、次のデートを登録しよう"
                        )
                        Spacer()
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 40)
                } else {
                    ScrollViewReader { proxy in
                        ScrollView(showsIndicators: false) {
                            LazyVStack(spacing: 14) {
                                Color.clear.frame(height: 1).id("schedule-top")
                                ForEach(model.sortedDatesNewestFirst, id: \.stableID) { plan in
                                    scheduleRow(plan)
                                }
                                Color.clear.frame(height: 96)
                            }
                            .padding(.horizontal, 20)
                            .padding(.top, 8)
                        }
                        .onAppear {
                            proxy.scrollTo("schedule-top", anchor: .top)
                        }
                    }
                }
            }
            .navigationTitle("今後の予定")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        editorPlan = DatePlan.blank(on: Date())
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(theme.primary)
                    }
                }
            }
            .toolbarBackground(theme.background, for: .navigationBar)
            .sheet(item: $detailPlan) { plan in
                DateDetailSheet(plan: plan)
                    .environment(model)
                    .environment(\.appTheme, theme)
            }
            .sheet(item: $editorPlan) { plan in
                DateEditorView(plan: plan)
                    .environment(model)
                    .environment(\.appTheme, theme)
            }
        }
    }

    private func scheduleRow(_ plan: DatePlan) -> some View {
        let isPast = DateFormatting.daysUntil(plan.date) < 0
        return Button {
            Haptics.light()
            detailPlan = plan
        } label: {
            AppCard {
                HStack(alignment: .center, spacing: 16) {
                    VStack(spacing: 2) {
                        Text(dayNumber(plan.date))
                            .font(.manmaru(.title, weight: .bold))
                            .foregroundStyle(theme.text)
                        Text(monthLabel(plan.date))
                            .font(.manmaru(.caption, weight: .semibold))
                            .foregroundStyle(theme.textSecondary)
                    }
                    .frame(width: 52)

                    VStack(alignment: .leading, spacing: 6) {
                        Text(plan.displayTitle)
                            .font(.manmaru(.headline, weight: .semibold))
                            .foregroundStyle(theme.text)
                        Text(DateFormatting.fullDate(plan.date))
                            .font(.manmaru(.subheadline))
                            .foregroundStyle(theme.textSecondary)
                        if !plan.destinations.isEmpty {
                            Text(plan.destinations.map(\.name).joined(separator: " ・ "))
                                .font(.manmaru(.caption))
                                .foregroundStyle(theme.primary)
                                .lineLimit(1)
                        }
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(theme.textSecondary)
                }
            }
            .opacity(isPast ? 0.55 : 1)
        }
        .buttonStyle(.plain)
    }

    private func dayNumber(_ date: Date) -> String {
        "\(Calendar.current.component(.day, from: date))"
    }

    private func monthLabel(_ date: Date) -> String {
        "\(Calendar.current.component(.month, from: date))月"
    }
}
