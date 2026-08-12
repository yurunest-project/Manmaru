import SwiftUI

struct MainTabView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch model.selectedTab {
                case .calendar:
                    CalendarView()
                case .schedule:
                    ScheduleView()
                case .settings:
                    SettingsView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            tabBar
        }
        .ignoresSafeArea(.keyboard)
    }

    private var tabBar: some View {
        HStack(spacing: 8) {
            ForEach(MainTab.allCases) { tab in
                Button {
                    Haptics.light()
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                        model.selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 6) {
                        Image(systemName: tab.symbol)
                            .font(.system(size: 18, weight: .semibold))
                        Text(tab.title)
                            .font(.manmaru(.caption2, weight: .semibold))
                    }
                    .foregroundStyle(model.selectedTab == tab ? theme.onPrimary : theme.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        Capsule(style: .continuous)
                            .fill(model.selectedTab == tab ? theme.primary : Color.clear)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(8)
        .background(theme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: theme.shadow, radius: 20, x: 0, y: 8)
        .padding(.horizontal, 20)
        .padding(.bottom, 10)
    }
}
