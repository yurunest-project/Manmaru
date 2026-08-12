import SwiftUI

struct DateDetailSheet: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @Environment(\.dismiss) private var dismiss
    let plan: DatePlan
    @State private var memoText: String
    @State private var showEditor = false
    @State private var confirmDelete = false
    @State private var memoSaveTask: Task<Void, Never>?

    init(plan: DatePlan) {
        self.plan = plan
        _memoText = State(initialValue: plan.memo)
    }

    private var livePlan: DatePlan {
        model.dates.first { $0.stableID == plan.stableID } ?? plan
    }

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 20) {
                        header
                        destinationsSection
                        memoSection
                        Color.clear.frame(height: 24)
                    }
                    .padding(20)
                }
            }
            .navigationTitle("デートの詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(theme.primary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("編集", systemImage: "pencil") { showEditor = true }
                        Button("削除", systemImage: "trash", role: .destructive) { confirmDelete = true }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundStyle(theme.primary)
                    }
                }
            }
            .toolbarBackground(theme.background, for: .navigationBar)
            .sheet(isPresented: $showEditor) {
                DateEditorView(plan: livePlan)
                    .environment(model)
                    .environment(\.appTheme, theme)
            }
            .alert("この予定を削除しますか？", isPresented: $confirmDelete) {
                Button("削除", role: .destructive) {
                    Task {
                        await model.deleteDate(livePlan)
                        dismiss()
                    }
                }
                Button("キャンセル", role: .cancel) {}
            }
        }
        .environment(\.appTheme, theme)
        .onChange(of: livePlan.memo) { _, newValue in
            if memoText != newValue {
                memoText = newValue
            }
        }
    }

    private var header: some View {
        AppCard {
            VStack(alignment: .leading, spacing: 8) {
                Text(DateFormatting.countdownLabel(to: livePlan.date))
                    .font(.manmaru(.caption, weight: .bold))
                    .foregroundStyle(theme.onPrimary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(theme.primary)
                    .clipShape(Capsule())
                Text(DateFormatting.fullDate(livePlan.date))
                    .font(.manmaru(.title, weight: .bold))
                    .foregroundStyle(theme.text)
                Text(livePlan.displayTitle)
                    .font(.manmaru(.title3, weight: .semibold))
                    .foregroundStyle(theme.textSecondary)
            }
        }
    }

    private var destinationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("行き先")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)

            if livePlan.destinations.isEmpty {
                AppCard {
                    Text("まだ行き先がありません")
                        .font(.manmaru(.subheadline))
                        .foregroundStyle(theme.textSecondary)
                }
            } else {
                ForEach(livePlan.destinations) { destination in
                    Button {
                        Haptics.light()
                        MapsService.openDrivingRoute(to: destination)
                    } label: {
                        AppCard {
                            HStack(spacing: 14) {
                                Image(systemName: "car.fill")
                                    .font(.headline)
                                    .foregroundStyle(theme.onPrimary)
                                    .frame(width: 40, height: 40)
                                    .background(theme.primary)
                                    .clipShape(Circle())
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(destination.name)
                                        .font(.manmaru(.headline, weight: .semibold))
                                        .foregroundStyle(theme.text)
                                    if !destination.address.isEmpty {
                                        Text(destination.address)
                                            .font(.manmaru(.caption))
                                            .foregroundStyle(theme.textSecondary)
                                            .lineLimit(2)
                                    }
                                    Text("現在地から車ルートを開く")
                                        .font(.manmaru(.caption, weight: .semibold))
                                        .foregroundStyle(theme.primary)
                                }
                                Spacer()
                                Image(systemName: "arrow.up.right")
                                    .foregroundStyle(theme.textSecondary)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var memoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("メモ")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)

            AppCard {
                TextEditor(text: $memoText)
                    .scrollContentBackground(.hidden)
                    .font(.manmaru(.body))
                    .foregroundStyle(theme.text)
                    .frame(minHeight: 140)
                    .onChange(of: memoText) { _, newValue in
                        memoSaveTask?.cancel()
                        memoSaveTask = Task {
                            try? await Task.sleep(for: .milliseconds(450))
                            guard !Task.isCancelled else { return }
                            saveMemo(newValue)
                        }
                    }
            }
        }
    }

    private func saveMemo(_ text: String) {
        var updated = livePlan
        guard updated.memo != text else { return }
        updated.memo = text
        Task { await model.saveDate(updated) }
    }
}
