import SwiftUI

struct MonthGridView: View {
    @Environment(\.appTheme) private var theme
    @Binding var visibleMonth: Date
    let dates: [DatePlan]
    let nextDate: DatePlan?
    let onSelectDay: (Date) -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)
    private var calendar: Calendar { Calendar.current }

    var body: some View {
        AppCard(padding: 16) {
            VStack(spacing: 16) {
                header
                weekdayRow
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(Array(days.enumerated()), id: \.offset) { _, day in
                        if let day {
                            dayCell(day)
                        } else {
                            Color.clear.frame(height: 44)
                        }
                    }
                }
            }
        }
    }

    private var header: some View {
        HStack {
            Button {
                changeMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.headline)
                    .foregroundStyle(theme.text)
                    .frame(width: 36, height: 36)
                    .background(theme.surfaceMuted)
                    .clipShape(Circle())
            }
            Spacer()
            Text(DateFormatting.monthTitle(visibleMonth))
                .font(.manmaru(.title3, weight: .bold))
                .foregroundStyle(theme.text)
            Spacer()
            Button {
                changeMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.headline)
                    .foregroundStyle(theme.text)
                    .frame(width: 36, height: 36)
                    .background(theme.surfaceMuted)
                    .clipShape(Circle())
            }
        }
    }

    private var weekdayRow: some View {
        HStack {
            ForEach(Array(DateFormatting.weekdaySymbols().enumerated()), id: \.offset) { index, symbol in
                Text(symbol)
                    .font(.manmaru(.caption, weight: .semibold))
                    .foregroundStyle(index == 0 ? theme.danger.opacity(0.8) : theme.textSecondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private func dayCell(_ day: Date) -> some View {
        let isToday = calendar.isDateInToday(day)
        let plans = dates.filter { $0.date.isSameDay(as: day) }
        let isNext = nextDate?.date.isSameDay(as: day) == true
        let dayNumber = calendar.component(.day, from: day)

        return Button {
            onSelectDay(day)
        } label: {
            VStack(spacing: 4) {
                Text("\(dayNumber)")
                    .font(.manmaru(.body, weight: isNext || isToday ? .bold : .medium))
                    .foregroundStyle(isNext ? theme.onPrimary : theme.text)
                    .frame(width: 36, height: 36)
                    .background {
                        if isNext {
                            Circle().fill(theme.primary)
                        } else if isToday {
                            Circle().stroke(theme.primary, lineWidth: 2)
                        }
                    }
                Circle()
                    .fill(plans.isEmpty ? Color.clear : (isNext ? theme.accent : theme.primary))
                    .frame(width: 5, height: 5)
            }
            .frame(maxWidth: .infinity, minHeight: 44)
        }
        .buttonStyle(.plain)
    }

    private var days: [Date?] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: visibleMonth),
              let firstWeekdayIndex = Optional(calendar.component(.weekday, from: monthInterval.start))
        else { return [] }

        let leading = firstWeekdayIndex - 1
        let count = calendar.range(of: .day, in: .month, for: visibleMonth)?.count ?? 0
        var result: [Date?] = Array(repeating: nil, count: leading)
        for offset in 0..<count {
            result.append(calendar.date(byAdding: .day, value: offset, to: monthInterval.start))
        }
        while result.count % 7 != 0 {
            result.append(nil)
        }
        return result
    }

    private func changeMonth(_ value: Int) {
        if let next = calendar.date(byAdding: .month, value: value, to: visibleMonth) {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.86)) {
                visibleMonth = next
            }
        }
    }
}
