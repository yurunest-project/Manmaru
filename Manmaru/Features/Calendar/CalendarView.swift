import SwiftUI

struct CalendarView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @State private var visibleMonth = Date()
    @State private var detailPlan: DatePlan?
    @State private var editorPlan: DatePlan?
    @State private var dayPlans: DayPlans?

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        NextDateCard(plan: model.nextDate) {
                            if let plan = model.nextDate {
                                detailPlan = plan
                            } else {
                                editorPlan = DatePlan.blank(on: Date())
                            }
                        }
                        MonthGridView(
                            visibleMonth: $visibleMonth,
                            dates: model.dates,
                            nextDate: model.nextDate
                        ) { day in
                            handleTap(on: day)
                        }
                        Color.clear.frame(height: 88)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                }
            }
            .navigationTitle("カレンダー")
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
            .sheet(item: $dayPlans) { wrapper in
                DayPlanPicker(plans: wrapper.plans) { plan in
                    dayPlans = nil
                    Task {
                        try? await Task.sleep(for: .milliseconds(320))
                        detailPlan = plan
                    }
                }
                .presentationDetents([.medium])
                .environment(\.appTheme, theme)
            }
        }
    }

    private func handleTap(on day: Date) {
        Haptics.light()
        let plans = model.dates(on: day)
        if plans.isEmpty {
            editorPlan = DatePlan.blank(on: day)
        } else if plans.count == 1 {
            detailPlan = plans[0]
        } else {
            dayPlans = DayPlans(date: day, plans: plans)
        }
    }
}

private struct DayPlans: Identifiable {
    var id: Date { date }
    let date: Date
    let plans: [DatePlan]
}

private struct DayPlanPicker: View {
    @Environment(\.appTheme) private var theme
    let plans: [DatePlan]
    let onSelect: (DatePlan) -> Void

    var body: some View {
        NavigationStack {
            List(plans, id: \.stableID) { plan in
                Button {
                    onSelect(plan)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(plan.displayTitle)
                            .font(.manmaru(.headline, weight: .semibold))
                            .foregroundStyle(theme.text)
                        Text("行き先 \(plan.destinations.count)件")
                            .font(.manmaru(.caption))
                            .foregroundStyle(theme.textSecondary)
                    }
                }
            }
            .navigationTitle("この日の予定")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
